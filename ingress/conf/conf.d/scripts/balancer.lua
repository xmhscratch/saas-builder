local balancer = require "ngx.balancer"

local function isEmptyString(str)
    if not str or str == "" then
        return true
    else
        return false
    end
end

local function trim(str)
    if str == '' then
        return str
    else
        local startPos = 1
        local endPos = #str

        while (startPos < endPos and str:byte(startPos) <= 32) do
            startPos = startPos + 1
        end

        if startPos >= endPos then
            return ''
        else
            while (endPos > 0 and str:byte(endPos) <= 32) do
                endPos = endPos - 1
            end

            return str:sub(startPos, endPos)
        end
    end
end -- .function trim

local ENV_NAME = os.getenv("ENV_NAME")
if not ENV_NAME then
    ENV_NAME = "development"
else
    if ENV_NAME == "production" then
        ENV_NAME = "production"
    else
        ENV_NAME = "development"
    end
end

local function getAppConfig(appId)
    if not appId or appId == "" then
        appId = "www"
    end

    if not ngx.ctx.app then
        return nil
    end

    return ngx.ctx.app:get(appId)
end

local appId = ngx.ctx.appId
local appConfig = getAppConfig(appId)

if not appConfig then
    ngx.exit(ngx.HTTP_NOT_FOUND)
    return
end

local hostName = appConfig["name"]
local hostPort = appConfig["port"]

local dnsResHandle = io.popen("getent ahosts " .. hostName .. " | grep -Po '\\K[\\d.]+' | head -1")
local hostIP = dnsResHandle:read("*a")
dnsResHandle:close()

local host = trim(hostIP)
local port = trim(hostPort)

-- if ENV_NAME == "development" then
--     ngx.log(ngx.NOTICE, appId)
--     ngx.log(ngx.NOTICE, hostName)
--     ngx.log(ngx.NOTICE, "getent ahosts " .. hostName .. " | grep -Po '\\K[\\d.]+' | head -1")
--     ngx.log(ngx.NOTICE, "http://" .. host .. ":" .. port)
-- end

-- local ok, err = balancer.set_more_tries(3)
-- if err or not ok then
--     ngx.log(ngx.ERR, "failed to retries the peer: ", err)
-- end

local ok, err = balancer.set_current_peer(host, port)
if err or not ok then
    ngx.log(ngx.ERR, "failed to set the peer: ", err)
    ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
    -- ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
end

-- local ok, err = balancer.set_current_peer("10.0.2.242", "5030")
