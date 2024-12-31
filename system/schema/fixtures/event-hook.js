module.exports = () => {
    // const isDevelopment = config('system.development', true)
    const urls = config('urls.cluster')

    return [
        {
            topicName: 'app',
            action: 'installed',
            triggerCondition: 'objects.context.app.appName == \'core\'',
            actionUrl: `http://${urls.integration}/system/app/installed`,
        },
        {
            topicName: 'app',
            action: 'uninstalled',
            triggerCondition: 'objects.context.app.appName == \'core\'',
            actionUrl: `http://${urls.integration}/system/app/uninstalled`,
        },
        {
            topicName: 'wallet',
            action: 'recorded',
            triggerCondition: 'objects.context.app.appName == \'core\'',
            actionUrl: `http://${urls.integration}/system/wallet/recorded`,
        },
        {
            topicName: 'subscription',
            action: 'unsubscribe',
            triggerCondition: 'objects.context.app.appName == \'core\'',
            actionUrl: `http://${urls.integration}/system/subscription/unsubscribe`,
        },
        {
            topicName: 'subscription',
            action: 'subscribe',
            triggerCondition: 'objects.context.app.appName == \'core\'',
            actionUrl: `http://${urls.integration}/system/subscription/subscribe`,
        },
        {
            topicName: 'subscription',
            action: 'status',
            triggerCondition: 'objects.context.app.appName == \'core\'',
            actionUrl: `http://${urls.integration}/system/subscription/unsubscribe`,
        },
        {
            topicName: 'subscription',
            action: 'upgrade',
            triggerCondition: 'objects.context.app.appName == \'core\'',
            actionUrl: `http://${urls.integration}/system/subscription/status`,
        },
        {
            topicName: 'subscription',
            action: 'active',
            triggerCondition: 'objects.context.app.appName == \'core\'',
            actionUrl: `http://${urls.integration}/system/subscription/status`,
        },
        {
            topicName: 'subscription',
            action: 'suspend',
            triggerCondition: 'objects.context.app.appName == \'core\'',
            actionUrl: `http://${urls.integration}/system/subscription/status`,
        },
        {
            topicName: 'user',
            action: 'login',
            triggerCondition: 'true',
            actionUrl: `http://${urls.integration}/system/user/login/`,
        },
        {
            topicName: 'user',
            action: 'register',
            triggerCondition: 'true',
            actionUrl: `http://${urls.integration}/system/user/register/`,
        },
        {
            topicName: 'organization',
            action: 'create',
            triggerCondition: 'true',
            actionUrl: `http://${urls.integration}/system/organization/create/`,
        },
        {
            topicName: 'organization',
            action: 'switch',
            triggerCondition: 'true',
            actionUrl: `http://${urls.integration}/system/organization/switch/`,
        },
    ]
}
