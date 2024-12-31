module.exports = `
SELECT
    id,
    account_id AS accountId,
    created_at AS createdAt,
    organization_id AS organizationId
FROM
    contributors AS Contributor
WHERE Contributor.id NOT IN (
    SELECT
        contributor_id AS contributorId
    FROM channel_contributors AS ChannelContributor
    WHERE (
        ChannelContributor.channel_id = :channelId
        AND ChannelContributor._organization_id = :organizationId
    )
) AND Contributor.organization_id = :organizationId
LIMIT :offset, :limit;
`
