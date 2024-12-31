local mysql = require "resty.mysql"
local redis = require "resty.redis"
local lrucache = require "resty.lrucache"

--- toBoolean
-- @param str
-- @return bool
-- @return err
local function toBoolean(str)
    local type = type
    local assert = assert
    local strformat = string.format

    --- constants
    local TRUE = {
        ['1'] = true,
        ['t'] = true,
        ['T'] = true,
        ['true'] = true,
        ['TRUE'] = true,
        ['True'] = true
    }

    local FALSE = {
        ['0'] = false,
        ['f'] = false,
        ['F'] = false,
        ['false'] = false,
        ['FALSE'] = false,
        ['False'] = false
    }

    assert(type(str) == 'string', 'str must be string')

    if TRUE[str] == true then
        return true
    elseif FALSE[str] == false then
        return false
    else
        return false, strformat('cannot convert %q to boolean', str)
    end
end

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

local function getHostIP(hostName)
    local dnsResp = io.popen("getent ahosts " .. hostName .. " | grep -Po '\\K[\\d.]+' | head -1")
    local hostIp = trim(dnsResp:read("*a"))

    dnsResp:close()
    return hostIp
end

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

local MYSQL_HOST = os.getenv("MYSQL_HOST")
local MYSQL_PORT = os.getenv("MYSQL_PORT")
if not MYSQL_PORT then
    MYSQL_PORT = 3306
end

local MYSQL_DATABASE_NAME = os.getenv("MYSQL_DATABASE_NAME")

local MYSQL_USER = os.getenv("MYSQL_USER")
if not MYSQL_USER then
    MYSQL_USER = "root"
end

local MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")

local REDIS_HOST = os.getenv("REDIS_HOST")
local REDIS_AUTH_PASSWORD = os.getenv("REDIS_AUTH_PASSWORD")

local MYSQL_HOST_IP_ADDRESS = getHostIP(MYSQL_HOST)
local REDIS_HOST_IP_ADDRESS = getHostIP(REDIS_HOST)

-- ngx.log(ngx.NOTICE, MYSQL_HOST)
-- ngx.log(ngx.NOTICE, "mysql://", MYSQL_USER, ":", MYSQL_PASSWORD, "@", MYSQL_HOST_IP_ADDRESS, ":", MYSQL_PORT, "/", MYSQL_DATABASE_NAME)

local function connectRedis()
    local red = redis:new()
    -- red:set_timeouts(10 * 1000, 10 * 1000, 10 * 1000) -- 10 sec

    -- ngx.log(ngx.NOTICE, "redis://", ":", REDIS_AUTH_PASSWORD, "@", REDIS_HOST, ":6379")

    local ok, err = red:connect(REDIS_HOST_IP_ADDRESS, 6379)
    if not ok then
        ngx.say("failed to connect: ", err)
        return
    end

    local res, err = red:auth(REDIS_AUTH_PASSWORD)
    if not res then
        ngx.say("failed to authenticate: ", err)
        return
    end

    return red
end

local function closeRedis(red)
    if not red then
        return
    end

    -- -- local ok, err = red:close()
    -- if not ok then
    --     if not err == "closed" then
    --         ngx.log(ngx.ERR, "failed to close: ", err)
    --         ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
    --     end
    -- end

    -- put it into the connection pool of size 100,
    -- with 10 seconds max idle time
    local ok, err = red:set_keepalive(10 * 1000, 1000)
    if not ok then
        ngx.say("failed to set keepalive: ", err)
        return
    end

    return
end

local function closeDatabase(db)
    if not db then
        return
    end

    -- -- close the connection right away
    -- local ok, err = db:close()
    -- if not ok then
    --     if not err == "closed" then
    --         ngx.log(ngx.ERR, "failed to close: ", err)
    --         ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
    --     end
    -- end

    local ok, err = db:set_keepalive(30 * 1000, 1000)
    if not ok then
        ngx.log(ngx.ERR, "failed to set keepalive: ", err)

        ngx.status = ngx.HTTP_INTERNAL_SERVER_ERROR
        ngx.header.content_type = "application/json; charset=utf-8"

        return ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
    end

    -- if ENV_NAME == "development" then
    --     ngx.log(ngx.NOTICE, "closed connection to mysql")
    -- end

    return
end

local function rejectRequest(db)
    if db ~= nil then
        closeDatabase(db)
    end

    ngx.status = ngx.HTTP_INTERNAL_SERVER_ERROR
    ngx.header.content_type = "application/json; charset=utf-8"

    return ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
end

local function notAuthorized(db)
    if db ~= nil then
        closeDatabase(db)
    end

    ngx.status = ngx.HTTP_UNAUTHORIZED
    ngx.header.content_type = "application/json; charset=utf-8"

    return ngx.exit(ngx.HTTP_UNAUTHORIZED)
end

local function acceptRequest(db)
    if db ~= nil then
        closeDatabase(db)
    end

    local ssid_header = ngx.req.get_headers()["x-ssid"]
    if not isEmptyString(ssid_header) then
        local red = connectRedis()
        local session_key = "session_" .. ssid_header

        local ok, err = red:select("1")
        if not ok then
            closeRedis(red)

            ngx.log(ngx.ERR, "failed to select db: ", err)
            return rejectRequest()
        end

        local ttlSec, err = red:ttl(session_key)
        if err ~= nil then
            closeRedis(red)

            ngx.log(ngx.ERR, "failed to check session ttl: ", err)
            return rejectRequest()
        end

        if ttlSec >= 0 then
            local ok, err = red:expire(session_key, 30 * 60)
            if not ok then
                ngx.log(ngx.ERR, "failed to ping session ttl: ", err)
                ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
            end
        end

        closeRedis(red)
        ngx.header["x-ssid-ttl"] = ttlSec
    end

    ngx.status = ngx.HTTP_OK
    return
end

local function connectDatabase()
    local db, err = mysql:new()
    if not db then
        ngx.log(ngx.ERR, "failed to instantiate mysql: ", err)
        return rejectRequest(db)
    end

    local ok, err, errcode, sqlstate = db:connect{
        host = MYSQL_HOST_IP_ADDRESS,
        port = MYSQL_PORT,
        database = MYSQL_DATABASE_NAME,
        user = MYSQL_USER,
        password = MYSQL_PASSWORD,
        charset = "ascii",
        max_packet_size = 1024 * 1024
    }

    if not ok then
        ngx.log(ngx.ERR, "failed to connect: ", err, ": ", errcode, " ", sqlstate)
        return rejectRequest(db)
    end

    return db
end

local db = connectDatabase()

local c, err = lrucache.new(100)
if not c then
    return ngx.log(ngx.ERR, "failed to create the cache: " .. (err or "unknown"))
end

local serviceDbName = "app_services"
if ENV_NAME == "development" then
    serviceDbName = "DEV_app_services"
end

local sqlString = "SELECT " .. "`service_name` AS `serviceName`, " .. "`expose_port` AS `exposePort`, " ..
                      "`cluster_domain_name` AS `clusterDomainName`, " .. "`has_credentials` AS `hasCredentials` " ..
                      "FROM `" .. serviceDbName .. "`;"

local res, err, errcode, sqlstate = db:query(sqlString)
if err or errcode then
    ngx.log(ngx.ERR, "bad result: ", err, ": ", errcode, ": ", sqlstate, ".")
    return rejectRequest(db)
end

if not res then
    ngx.log(ngx.ERR, "empty response")
    return rejectRequest(db)
end

for i, v in ipairs(res) do
    -- if ENV_NAME == "development" then
    --     ngx.log(ngx.NOTICE, tostring(v["serviceName"]), ":", tostring(v["exposePort"]), ":", tostring(v["clusterDomainName"]))
    -- end

    c:set(tostring(v["serviceName"]), {
        port = tostring(v["exposePort"]),
        name = tostring(v["clusterDomainName"]),
        hasCredentials = tostring(v["hasCredentials"])
    })
end

ngx.ctx.app = c

local appId = ngx.re.sub(ngx.var.host, "^([a-z0-9_-]+).".. os.getenv("LTD_DOMAIN") ..".([a-z]{2,5})$", "$1", "o")
ngx.ctx.appId = appId

local function validateToken(user_id, auth_token)
    if isEmptyString(user_id) then
        return false
    end

    if isEmptyString(auth_token) then
        return false
    end

    local sqlString =
        "SELECT `token`, `user_id`, `expires_at` " .. "FROM `oauth_access_tokens` WHERE " .. "`user_id`=" ..
            ngx.quote_sql_str(user_id) .. " AND " .. "`token`=" .. ngx.quote_sql_str(auth_token) .. " AND " ..
            "`expires_at` > NOW() " .. "LIMIT 1;"

    local res, err, errcode, sqlstate = db:query(sqlString)
    if err or errcode then
        ngx.log(ngx.ERR, "bad result: ", err, ": ", errcode, ": ", sqlstate, ".")
        return false
    end

    if not res then
        return false
    end

    return true
end

local appInfo = c:get(tostring(appId))

if ngx.var.directive == "api-proxy" then
    local has_credentials = toBoolean(appInfo["hasCredentials"])
    if not has_credentials then
        return acceptRequest(db)
    end

    local headers = ngx.req.get_headers()
    -- local super_token_header = headers["__sstk"]
    -- if not isEmptyString(super_token_header) or super_token_header == "opartdu2kfhhuckujhwx936q8647f03tfjry" then
    --     return acceptRequest(db)
    -- end

    local use_default_type = true
    local acceptTypes = headers["accept"]
    if not isEmptyString(acceptTypes) then
        for k, v in string.gmatch(acceptTypes, "([%w\\*]+)/([%w\\*]+)([^\\,]*)") do
            if not (k == "application" and v == "json") or not (k == "text" and v == "javascript") then
                use_default_type = false
                break
            end
        end
    end

    if use_default_type == true then
        ngx.header.content_type = "application/json; charset=utf-8"
    end

    local user_id = nil
    local user_id_header = headers["x-user-id"]
    if not isEmptyString(user_id_header) then
        user_id = user_id_header
    else
        return notAuthorized(db)
    end

    local auth_token = nil
    local authorization_header = headers["authorization"]
    if not isEmptyString(authorization_header) then
        local _, _, matchedToken = string.find(authorization_header, "Bearer%s+(.+)")
        auth_token = trim(matchedToken)
    else
        return notAuthorized(db)
    end

    if ngx.var.request_method == "OPTIONS" then
        return acceptRequest(db)
    end

    local is_valid_access = validateToken(user_id, auth_token)
    if not is_valid_access then
        return notAuthorized(db)
    end

    return acceptRequest(db)
end

if ngx.var.directive == "content-proxy" then
    return acceptRequest(db)
end

if ngx.var.directive == "channel" then
    return acceptRequest(db)
end

return notAuthorized()
