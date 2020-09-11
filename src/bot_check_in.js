// Запуск телеграфа
const { Telegraf } = require('telegraf')
const session = require('telegraf/session')
const Stage = require('telegraf/stage')
const Scene = require('telegraf/scenes/base')
const { leave } = Stage

// config Token
const config = require('../config.js')
const TOKEN = (config.TOKEN_test)
const bot = new Telegraf(TOKEN)

// Service
const moment = require('moment')
const time_to_mill = require('./time_to_mill')
const flat = require('array.prototype.flat')
const dhm = require('./mill_to_time')

// Подключение MuSQL
const connection = require('./connect_db_mysql')

// Логирование 
const log4js = require("log4js");

log4js.configure({
    appenders: { info: { type: "file", filename: "error.log" } },
    categories: { default: { appenders: ["info"], level: "info" }, }
});
const logger = log4js.getLogger("info")





const manager = new Scene('manager')
const select_date = new Scene('select_date')
const stage = new Stage()

// Scene registration

stage.register(manager)
stage.register(select_date)

bot.use(session())
bot.use(stage.middleware())
bot.startPolling()


manager.on('message', leave())
select_date.on('message', leave())




bot.on('callback_query', (query) => {
    switch (query.update.callback_query.data) {
        case 'select_date':
            query.scene.enter('select_date')
            break;
        case 'select_date_mount':
            query.scene.enter('select_date')
            break;
        default:
            query.scene.enter('manager')
            break;
    }
})




bot.on('location', (ctx) => {
    connection.query(`SELECT status_now, department, position, last_name FROM users_check_in_job WHERE user_id='${ctx.update.message.from.id}'`, (error, res) => {
        if (res.length === 0) {
            ctx.reply(`К сожалению вы не состоите в команде Pizza Day, если вы являетесь сотрудником то обратитесь к вашему руководителю.`)
        } else {
            switch (res[0].status_now) {
                case 'check_out':
                    console.log('true' + res[0].status_now);
                    ctx.reply(`Вы пришли на заведение 👏🌞🌞🌞🌞 \n ‼️Если у вас не поменялось название кнопки, то подождите секунд - 30, если ничего не произошло нажмите еще раз на "Check in 🤞👌👋"‼️`, {
                        reply_markup: { keyboard: [[{ text: 'Покинуть ТТ 🏃‍♂️🏃‍♀️', request_location: true }]] }
                    }).then(result => {
                        connection.query(`UPDATE users_check_in_job SET status_now='check_in' WHERE user_id='${ctx.update.message.from.id}' `, (error, res_update) => {
                            connection.query(`UPDATE users_check_in_job SET arrival_time='${new Date()}' WHERE user_id='${ctx.update.message.chat.id}' `, (error, res_update) => {
                                if (res[0].position === "Торговая сеть №1") {
                                    bot.telegram.sendMessage(config.rm_vika_id, `Пришел на ТТ 👇👇👇👇👇👇👇: ${new Date().toLocaleString()}`).then((res) => {
                                        ctx.forwardMessage(config.rm_vika_id, ctx.update.message.location).then(res => {
                                            bot.telegram.sendMessage(config.rm_vika_id, `☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️`)
                                        })
                                    })
                                    //bot.telegram.sendMessage(config.rn_jenya_id, `Пришел на ТТ 👇👇👇👇👇👇👇: ${new Date().toLocaleString()}`).then((res) => {
                                    //ctx.forwardMessage(config.rn_jenya_id, ctx.update.message.location).then(res => {
                                    //bot.telegram.sendMessage(config.rn_jenya_id, `☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️`)
                                    //})
                                    //})
                                    logger.info(`'${new Date().toLocaleString() + "__" + res[0].last_name + ": прибыл(ла) на ТТ"}'`)

                                } else if (res[0].position === "Торговая сеть №2") {
                                    bot.telegram.sendMessage(config.rm_danil_id, `Пришел на ТТ 👇👇👇👇👇👇👇: ${new Date().toLocaleString()}`).then((res) => {
                                        ctx.forwardMessage(config.rm_danil_id, ctx.update.message.location).then(res => {
                                            bot.telegram.sendMessage(config.rm_danil_id, `☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️`)
                                        })
                                    })
                                    //bot.telegram.sendMessage(config.rn_jenya_id, `Пришел на ТТ 👇👇👇👇👇👇👇: ${new Date().toLocaleString()}`).then((res) => {
                                    //ctx.forwardMessage(config.rn_jenya_id, ctx.update.message.location).then(res => {
                                    //bot.telegram.sendMessage(config.rn_jenya_id, `☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️`)
                                    //})
                                    //})
                                    logger.info(`'${new Date().toLocaleString() + "__" + res[0].last_name + ": прибыл(ла) на ТТ"}'`)
                                }
                            })
                        })
                    })
                    break;
                case 'check_in':
                    ctx.reply(`Нажмите "Check in" \n ‼️Если у вас не поменялось название кнопки, то подождите секунд - 30, если ничего не произошло нажмите еще раз на "Покинуть ТТ 🏃‍♂️🏃‍♀️"‼️`, {
                        reply_markup:
                        {
                            keyboard: [[{ text: 'Check in 🤞👌👋', request_location: true }]]
                        }
                    }).then(result => {
                        connection.query(`UPDATE users_check_in_job SET status_now='check_out' WHERE user_id='${ctx.update.message.from.id}' `, (error, res) => {
                            connection.query(`SELECT * FROM users_check_in_job WHERE user_id='${ctx.update.message.from.id}'`, (error, res) => {
                                let last = new Date(res[0].arrival_time)
                                let d = new Date()
                                let ms = (d.getTime() - last.getTime())
                                let stay_time = moment.utc(ms).format('HH:mm:ss')

                                connection.query(`INSERT INTO check_in_job_archive(user_id, first_name, last_name, number_phone, mount_date, one_date, stay_time) VALUES ('${ctx.message.chat.id}','${res[0].first_name}','${res[0].last_name}','${res[0].number_phone}','${moment(new Date()).format("MM.YY")}','${moment(new Date()).format("DD.MM.YY")}','${stay_time}')`,
                                    (error, res_insert) => {
                                        if (res[0].position === "Торговая сеть №1") {
                                            bot.telegram.sendMessage(config.rm_vika_id, `Покинул ТТ 👇👇👇👇👇👇👇: ${new Date().toLocaleString()}`).then((res) => {
                                                ctx.forwardMessage(config.rm_vika_id, ctx.update.message.location).then((res) => {
                                                    bot.telegram.sendMessage(config.rm_vika_id, `Время нахождение: ${stay_time}`).then((res) => {
                                                        bot.telegram.sendMessage(config.rm_vika_id, `☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️`)
                                                    })

                                                })
                                            })
                                            //bot.telegram.sendMessage(config.rn_jenya_id, `Покинул ТТ 👇👇👇👇👇👇👇: ${new Date().toLocaleString()}`).then((res) => {
                                            //ctx.forwardMessage(config.rn_jenya_id, ctx.update.message.location).then((res) => {
                                            // bot.telegram.sendMessage(config.rn_jenya_id, `Время нахождение: ${stay_time}`).then((res) => {
                                            //bot.telegram.sendMessage(config.rn_jenya_id, `☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️`)
                                            //})

                                            // })
                                            // })
                                            logger.info(`'${new Date().toLocaleString() + "__" + res[0].last_name + ": Покинул(ла) ТТ"}'`)
                                        }
                                        else if (res[0].position === "Торговая сеть №2") {
                                            bot.telegram.sendMessage(config.rm_danil_id, `Покинул ТТ 👇👇👇👇👇👇👇: ${new Date().toLocaleString()}`).then((res) => {
                                                ctx.forwardMessage(config.rm_danil_id, ctx.update.message.location).then((res) => {
                                                    bot.telegram.sendMessage(config.rm_danil_id, `Время нахождение: ${stay_time}`).then((res) => {
                                                        bot.telegram.sendMessage(config.rm_danil_id, `☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️`)
                                                    })
                                                })
                                            })
                                            //bot.telegram.sendMessage(config.rn_jenya_id, `Покинул ТТ 👇👇👇👇👇👇👇: ${new Date().toLocaleString()}`).then((res) => {
                                            //ctx.forwardMessage(config.rn_jenya_id, ctx.update.message.location).then((res) => {
                                            // bot.telegram.sendMessage(config.rn_jenya_id, `Время нахождение: ${stay_time}`).then((res) => {
                                            // bot.telegram.sendMessage(config.rn_jenya_id, `☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️`)
                                            //})
                                            //})
                                            //})
                                            logger.info(`'${new Date().toLocaleString() + "__" + res[0].last_name + ": Покинул(ла) ТТ"}'`)
                                        }
                                    })
                            })
                        })
                    })
                    break;
                default:
                    ctx.reply(`Нажмите "Check in" \n ‼️Если у вас не поменялось название кнопки, то подождите секунд - 30, если ничего не произошло нажмите еще раз на "Покинуть ТТ 🏃‍♂️🏃‍♀️"‼️`, {
                        reply_markup:
                        {
                            keyboard: [[{ text: 'Check in 🤞👌👋', request_location: true }]]
                        }
                    }).then(result => {
                        connection.query(`UPDATE users_check_in_job SET status_now='check_in' WHERE user_id='${ctx.update.message.from.id}' `, (error, res) => { })
                    })
                    break;
            }
        }
    })
})


bot.start((ctx) => {
    console.log('start');
    connection.query(`SELECT position, number_phone, first_name, status_now FROM users_check_in_job WHERE user_id='${ctx.update.message.from.id}'`, (error, res) => {
        console.log(res.length);
        if (res.length === 0) {
            ctx.reply(`Привет! Для работы с ботом,\nнажмите 👉Поделится контактом👈`, {
                reply_markup: {
                    keyboard: [
                        [{
                            text: 'Поделится контактом',
                            request_contact: true,
                        }]
                    ],
                    resize_keyboard: true
                }
            })
        }
        else {
            if (res[0].position === "Территориальный Менеджер") {
                ctx.reply(`Привет ${res[0].first_name}!`, { reply_markup: { keyboard: [[{ text: 'Список менеджеров', }]], resize_keyboard: true, remove_keyboard: true } })
            }
            else if (res[0].position === "Руководитель направления") {
                ctx.reply(`Привет ${res[0].first_name}!`, { reply_markup: { remove_keyboard: true } })
            }
            else {
                switch (res[0].status_now) {
                    case 'check_in':
                        console.log('true' + res[0].status_now);
                        ctx.reply(`Вы пришли на заведение 👏🌞🌞🌞🌞 \n ‼️Если у вас не поменялось название кнопки, то подождите секунд - 30, если ничего не произошло нажмите еще раз на "Check in 🤞👌👋"‼️`, {
                            reply_markup: { keyboard: [[{ text: 'Покинуть ТТ 🏃‍♂️🏃‍♀️', request_location: true }]] }
                        })
                        break;
                    case 'check_out':
                        ctx.reply(`Нажмите "Check in" \n ‼️Если у вас не поменялось название кнопки, то подождите секунд - 30, если ничего не произошло нажмите еще раз на "Покинуть ТТ 🏃‍♂️🏃‍♀️"‼️`, {
                            reply_markup:
                            {
                                keyboard: [[{ text: 'Check in 🤞👌👋', request_location: true }]]
                            }
                        })
                        break;
                    default:
                        ctx.reply(`Нажмите "Check in" \n ‼️Если у вас не поменялось название кнопки, то подождите секунд - 30, если ничего не произошло нажмите еще раз на "Покинуть ТТ 🏃‍♂️🏃‍♀️"‼️`, {
                            reply_markup:
                            {
                                keyboard: [[{ text: 'Check in 🤞👌👋', request_location: true }]]
                            }
                        })
                        break;
                }
            }
        }
    })
})


bot.command('restart', (ctx) => {
    console.log('restart');
    connection.query(`SELECT position, number_phone, first_name, status_now FROM users_check_in_job WHERE user_id='${ctx.update.message.from.id}'`, (error, res) => {
        if (res.length === 0) {
            ctx.reply(`Привет! Для работы с ботом,\nнажмите 👉Поделится контактом👈`, {
                reply_markup: {
                    keyboard: [
                        [{
                            text: 'Поделится контактом',
                            request_contact: true,
                        }]
                    ],
                    resize_keyboard: true
                }
            })
        } else {
            if (res[0].position === "Территориальный Менеджер") {
                ctx.reply(`Привет ${res[0].first_name}!`, { reply_markup: { keyboard: [[{ text: 'Список менеджеров', }]], resize_keyboard: true, remove_keyboard: true } })
            }
            else if (res[0].position === "Руководитель направления") {
                ctx.reply(`Привет ${res[0].first_name}!`, { reply_markup: { remove_keyboard: true } })
            }
            else {
                switch (res[0].status_now) {
                    case 'check_in':
                        console.log('true' + res[0].status_now);
                        ctx.reply(`Вы пришли на заведение 👏🌞🌞🌞🌞 \n ‼️Если у вас не поменялось название кнопки, то подождите секунд - 30, если ничего не произошло нажмите еще раз на "Check in 🤞👌👋"‼️`, {
                            reply_markup: { keyboard: [[{ text: 'Покинуть ТТ 🏃‍♂️🏃‍♀️', request_location: true }]] }
                        })
                        break;
                    case 'check_out':
                        ctx.reply(`Нажмите "Check in" \n ‼️Если у вас не поменялось название кнопки, то подождите секунд - 30, если ничего не произошло нажмите еще раз на "Покинуть ТТ 🏃‍♂️🏃‍♀️"‼️`, {
                            reply_markup:
                            {
                                keyboard: [[{ text: 'Check in 🤞👌👋', request_location: true }]]
                            }
                        })
                        break;
                    default:
                        ctx.reply(`Нажмите "Check in" \n ‼️Если у вас не поменялось название кнопки, то подождите секунд - 30, если ничего не произошло нажмите еще раз на "Покинуть ТТ 🏃‍♂️🏃‍♀️"‼️`, {
                            reply_markup:
                            {
                                keyboard: [[{ text: 'Check in 🤞👌👋', request_location: true }]]
                            }
                        })
                        break;
                }
            }
        }
    })
})

bot.on('contact', (ctx) => {
    connection.query(`SELECT first_name, last_name, status_now FROM users_check_in_job WHERE number_phone=${ctx.message.contact.phone_number[0] === '+' ? ctx.message.contact.phone_number : ('+' + ctx.message.contact.phone_number)}`, (error, res) => {
        if (res.length === 0) {
            ctx.reply(`К сожалению вы не состоите в команде Pizza Day, если вы являетесь сотрудником то обратитесь к вашему руководителю.\n${ctx.message.contact.phone_number}`)
        } else {
            connection.query(`UPDATE users_check_in_job SET user_id='${ctx.update.message.from.id}' WHERE number_phone='${ctx.message.contact.phone_number[0] === '+' ? ctx.message.contact.phone_number : ('+' + ctx.message.contact.phone_number)}' `, (error, res) => {

                connection.query(`SELECT position, first_name FROM users_check_in_job WHERE user_id='${ctx.update.message.from.id}'`, (error, res) => {

                    if (res[0].position === "Территориальный Менеджер") {
                        ctx.reply(`Привет ${res[0].first_name}!`, { reply_markup: { keyboard: [[{ text: 'Список менеджеров', }]], resize_keyboard: true, remove_keyboard: true } })

                    }
                    else if (res[0].position === "Руководитель направления") {
                        ctx.reply(`Привет ${res[0].first_name}!`, { reply_markup: { remove_keyboard: true } })
                    }
                    else {
                        switch (res[0].status_now) {
                            case 'check_in':
                                console.log('true' + res[0].status_now);
                                ctx.reply(`Вы пришли на заведение 👏🌞🌞🌞🌞 \n ‼️Если у вас не поменялось название кнопки, то подождите секунд - 30, если ничего не произошло нажмите еще раз на "Check in 🤞👌👋"‼️`, {
                                    reply_markup: { keyboard: [[{ text: 'Покинуть ТТ 🏃‍♂️🏃‍♀️', request_location: true }]] }
                                })
                                break;
                            case 'check_out':
                                ctx.reply(`Нажмите "Check in" \n ‼️Если у вас не поменялось название кнопки, то подождите секунд - 30, если ничего не произошло нажмите еще раз на "Покинуть ТТ 🏃‍♂️🏃‍♀️"‼️`, {
                                    reply_markup:
                                    {
                                        keyboard: [[{ text: 'Check in 🤞👌👋', request_location: true }]]
                                    }
                                })
                                break;
                            default:
                                ctx.reply(`Нажмите "Check in" \n ‼️Если у вас не поменялось название кнопки, то подождите секунд - 30, если ничего не произошло нажмите еще раз на "Покинуть ТТ 🏃‍♂️🏃‍♀️"‼️`, {
                                    reply_markup:
                                    {
                                        keyboard: [[{ text: 'Check in 🤞👌👋', request_location: true }]]
                                    }
                                })
                                break;
                        }
                    }
                })
            })
        }
    })
})



bot.hears('Список менеджеров', (ctx) => {
    connection.query(`SELECT position, trade_net FROM users_check_in_job WHERE user_id='${ctx.update.message.from.id}'`, (error, res) => {
        if (res[0].position === "Территориальный Менеджер") {
            if (res[0].trade_net === "Сеть №1") {
                connection.query(`SELECT * FROM users_check_in_job WHERE position='Торговая сеть №1'`, (error, list_manager) => {
                    var list_name = []
                    var list_name = list_manager.map(lis => {

                        return list_name = [{ text: lis.first_name + ' ' + lis.last_name, callback_data: lis.first_name + ' ' + lis.last_name }]
                    })
                    ctx.reply('Ваши менеджера', {
                        reply_markup:
                        {
                            inline_keyboard: list_name
                        }

                    })

                })
            } else if (res[0].trade_net === "Сеть №2") {
                console.log(res[0].position);
                connection.query(`SELECT * FROM users_check_in_job WHERE position='Торговая сеть №2'`, (error, list_manager) => {
                    var list_name = []
                    var list_name = list_manager.map(lis => {
                        return list_name = [{ text: lis.first_name + ' ' + lis.last_name, callback_data: lis.first_name + ' ' + lis.last_name }]
                    })
                    ctx.reply('Ваши менеджера', {
                        reply_markup:
                        {
                            inline_keyboard: list_name

                        }
                    })
                })
            }
        }
        else {
            ctx.reply('К сожалению вы не состоите в команде Pizza Day, если вы являетесь сотрудником то обратитесь к вашему руководителю.', {
                reply_markup: { remove_keyboard: true }
            })
        }

    })
})

manager.enter((ctx) => {
    last_name = ctx.update.callback_query.data
    let last_names = last_name.split(' ')[1]
    ctx.deleteMessage((ctx.update.callback_query.message.message_id))
    ctx.deleteMessage((ctx.update.callback_query.message.message_id - 1))
    ctx.reply(`Менеджер: ${last_name}`, {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Время работы за один день', callback_data: `select_date` }],
                [{ text: 'Время работы за месяц', callback_data: `select_date_mount` }]
            ],
            remove_keyboard: true
        }
    })

    select_date.enter((ctx) => {
        ctx.deleteMessage((ctx.update.callback_query.message.message_id))
        if (ctx.update.callback_query.data === 'select_date') {
            ctx.reply('Введите дату в формате: 29.12.20')
            var bool_date = true
        }
        else if (ctx.update.callback_query.data === 'select_date_mount') {
            ctx.reply('Введите дату в формате: 12.20')
            var bool_date = false
        }

        select_date.leave((ctx) => {
            ctx.deleteMessage((ctx.update.message.message_id))
            ctx.deleteMessage((ctx.update.message.message_id - 1))
            let last_names = last_name.split(' ')[1]
            console.log("Получение данных по: " + last_names)
            if (bool_date === true) {
                console.log('one_date')
                connection.query(`SELECT * FROM check_in_job_archive WHERE last_name='${last_names}' AND one_date='${ctx.update.message.text}'`, (error, res_manager) => {
                    console.log(res_manager);
                    console.log(error);
                    if (res_manager.length === 0) {
                        ctx.reply(`Не верно введены данные или за этой датой ➡️${ctx.update.message.text}⬅️ нету никакой информации`)
                    } else {
                        let numb = res_manager.map(result => {
                            time_mill = []
                            time_mill.push(time_to_mill.toms(result.stay_time))
                            return time_mill
                        })
                        var all_time = moment.utc(flat(numb, 1).reduce((a, b) => a + b)).format('HH:mm:ss')

                        connection.query(`SELECT position, first_name FROM users_check_in_job WHERE user_id='${ctx.update.message.from.id}'`, (error, res) => {
                            console.log(last_name)
                            if (res[0].position === "Территориальный Менеджер") {
                                ctx.reply(`Менеджер: ${last_name}🐌 \n Отработано: \n  -Дата:🕙${ctx.update.message.text}🕙\n  -Время: ${all_time} 🧟‍♂️`, { reply_markup: { keyboard: [[{ text: 'Список менеджеров' }]], resize_keyboard: true } })
                            }
                        })
                    }

                })
            } else if (bool_date === false) {
                console.log('mount_date')
                console.log(ctx.update.message.text)
                console.log(last_names)
                connection.query(`SELECT stay_time FROM check_in_job_archive WHERE last_name='${last_names}' AND mount_date='${ctx.update.message.text}'`, (error, res_manager) => {
                    let numbs = res_manager.map(result => {
                        time_mill = []
                        time_mill.push(time_to_mill.toms(result.stay_time))
                        return time_mill
                    })
                    if (numbs.length === 0) {
                        ctx.reply(`Не верно введены данные или за этой датой ➡️${ctx.update.message.text}⬅️ нету никакой информации`)
                    } else {
                        let all_times = dhm.hm(flat(numbs, 1).reduce((a, b) => a + b))
                        // let all_times_2 = dhm.hm(flat(numbs, 1).reduce((a, b) => a + b))
                        // console.log('1 :' +all_times);
                        // console.log('2 :' + all_times_2);
                        connection.query(`SELECT position, first_name FROM users_check_in_job WHERE user_id='${ctx.update.message.from.id}'`, (error, res) => {
                            if (res[0].position === "Территориальный Менеджер") {
                                ctx.reply(`Менеджер: ${last_name}🐌 \n Отработано: \n  -Дата:🕙${ctx.update.message.text}🕙\n  -Время: ${all_times} 🧟‍♂️`, { reply_markup: { keyboard: [[{ text: 'Список менеджеров' }]], resize_keyboard: true } })
                            }
                        })
                    }


                })
            }
        })



    })





})

manager.leave((ctx) => {

})


// greeter.enter((ctx) => {
//     connection.query(`SELECT department, position, last_name FROM users_check_in_job WHERE user_id='${ctx.update.message.from.id}'`, (error, res) => {
//         connection.query(`UPDATE users_check_in_job SET arrival_time='${new Date()}' WHERE user_id='${ctx.message.chat.id}' `, (error, res) => { })
//         // if (res[0].position === "Торговая сеть №1") {

//         //     bot.telegram.sendMessage(config.admin_id, `Пришел на ТТ 👇👇👇👇👇👇👇: ${new Date().toLocaleString()}`).then((res) => {
//         //         ctx.forwardMessage(config.admin_id, ctx.update.message.location).then(res => {
//         //             bot.telegram.sendMessage(config.admin_id, `☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️`)
//         //         })
//         //     })
//         //     // bot.telegram.sendMessage(config.admin_id, `Пришел на ТТ: ${new Date().toLocaleString()}`)
//         //     ctx.reply('=)', { reply_markup: { keyboard: [[{ text: 'Check out', request_location: true }]], resize_keyboard: true } })
//         //     // ctx.forwardMessage(config.admin_id, ctx.update.message.text)



//         // } else if (res[0].position === "Торговая сеть №2") {

//         //     bot.telegram.sendMessage(config.admin_id, `Пришел на ТТ: ${new Date().toLocaleString()}`)
//         //     // bot.telegram.sendMessage(config.admin_id, `Пришел на ТТ: ${new Date().toLocaleString()}`)
//         //     ctx.reply('=)', { reply_markup: { keyboard: [[{ text: 'Check out', request_location: true }]], resize_keyboard: true } })
//         //     ctx.forwardMessage(config.admin_id, ctx.update.message.location)
//         //     // ctx.forwardMessage(config.test, ctx.update.message.text)
//         // }

//     
//     })
// })

// greeter.leave((ctx) => {
//     // stay_times.where(`date`).in(['2020-5-27']).then((res) => {
//     //     console.log({ res: res })
//     //     console.log({ ctx: ctx.message.chat });

//     //     // ctx.reply(`${JSON.stringify(res, null, 4)}`)

//     // })
// connection.query(`SELECT * FROM users_check_in_job WHERE user_id='${ctx.update.message.from.id}'`, (error, res) => {
//     let last = new Date(res[0].arrival_time)
//     let d = new Date()
//     let ms = (d.getTime() - last.getTime())
//     let stay_time = moment.utc(ms).format('HH:mm:ss')
//     let date = new Date()

//     connection.query(`INSERT INTO check_in_job_archive(user_id, first_name, last_name, number_phone, mount_date, one_date, stay_time) VALUES ('${ctx.message.chat.id}','${res[0].first_name}','${res[0].last_name}','${res[0].number_phone}','${moment(new Date()).format("MM.YY")}','${moment(new Date()).format("DD.MM.YY")}','${stay_time}')`,
//         (error, res) => { })
//         // if (res[0].position === "Торговая сеть №1") {

//         //     // bot.telegram.sendMessage(config.admin_id, `Покинул ТТ: ${new Date().toLocaleString()}`)
//         //     // bot.telegram.sendMessage(config.admin_id, `Время нахождение: ${stay_time}`)
//         //     bot.telegram.sendMessage(config.admin_id, `Покинул ТТ 👇👇👇👇👇👇👇: ${new Date().toLocaleString()}`).then((res) => {
//         //         ctx.forwardMessage(config.admin_id, ctx.update.message.location).then((res) => {
//         //             bot.telegram.sendMessage(config.admin_id, `Время нахождение: ${stay_time}`).then((res) => {
//         //                 bot.telegram.sendMessage(config.admin_id, `☝️☝️☝️☝️☝️☝️☝️☝️☝️☝️`)
//         //             })

//         //         })
//         //     })

//         //     ctx.reply('Чтобы отметить свое нахождение на заведении нажмите "Check in"', {
//         //         reply_markup: { keyboard: [[{ text: 'Check in', request_location: true }]], resize_keyboard: true }
//         //     })


//         //     // ctx.forwardMessage(config.admin_id, ctx.update.message.text)
//         // }
//         // else if (res[0].position === "Торговая сеть №2") {

//         //     bot.telegram.sendMessage(config.test, `Покинул ТТ: ${new Date().toLocaleString()}`)
//         //     bot.telegram.sendMessage(config.test, `Время нахождение: ${stay_time}`)
//         //     // bot.telegram.sendMessage(config.admin_id, `Покинул ТТ: ${new Date().toLocaleString()}`)
//         //     // bot.telegram.sendMessage(config.admin_id, `Время нахождение: ${stay_time}`)
//         //     ctx.reply('Чтобы отметить свое нахождение на заведении нажмите "Check in"', {
//         //         reply_markup:
//         //         {
//         //             keyboard: [[{ text: 'Check in', request_location: true }]],
//         //             resize_keyboard: true
//         //         }
//         //     })
//         //     ctx.forwardMessage(config.test, ctx.update.message.text)
//         //     // ctx.forwardMessage(config.admin_id, ctx.update.message.text)
//         // }

//        
//     })
// })





bot.on("polling_error", (err) => console.log(err));

bot.launch({ polling: true })
