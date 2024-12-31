module.exports = `
SELECT count(*) AS count
FROM contributors AS Contributor
WHERE Contributor.id NOT IN (
    SELECT
        contributor_id AS contributorId
    FROM channel_contributors AS ChannelContributor
    WHERE (
        ChannelContributor.channel_id = :channelId
        AND ChannelContributor._organization_id = :organizationId
    )
) AND Contributor.organization_id = :organizationId
`
