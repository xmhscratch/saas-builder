const { InfluxDB } = require('influx')

module.exports = async () => {
    const influx = new InfluxDB(config('influx'))
    influx.ping(1000).then(hosts => {
        hosts.forEach(host => {
            if (host.online) {
                console.log(`${host.url.host} responded in ${host.rtt}ms running ${host.version})`)
            } else {
                console.log(`${host.url.host} is offline`)
            }
        })
    })
    return influx
}
