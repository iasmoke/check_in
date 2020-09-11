module.exports = new_date = new Date().
    toLocaleTimeString('locales',
        {
            timeZone: "Europe/Kiev",
        }
    )
    + ` ` + new Date().
        toLocaleDateString('en-US',
            {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
            })

