module.exports = () => {
    return [
        {
            serviceName: "content",
            clusterDomainName: "system_content_app",
            exposePort: 3552,
            hasCredentials: false,
        },
        {
            serviceName: "integration",
            clusterDomainName: "system_integration_app",
            exposePort: 3600,
            hasCredentials: false,
        },
        {
            serviceName: "storage",
            clusterDomainName: "system_storage_app",
            exposePort: 5030,
            hasCredentials: true,
        },
        {
            serviceName: "www",
            clusterDomainName: "system_api_app",
            exposePort: 3500,
            hasCredentials: true,
        },
    ]
}
