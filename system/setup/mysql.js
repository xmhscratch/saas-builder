module.exports = async () => {
    const { MultiTenancy } = System.Orm

    const multiTenancy = new MultiTenancy()
    const ds = await multiTenancy
        .initialize('system_core')
        .catch(handleError)

    await multiTenancy
        .getGroup()
        .then((group) => group.getDb())
        .then((group) => {
            const MemberSchema = group._tables._members
            return MemberSchema.bulkCreate(
                [{ id: "f6u72m" }],
                { updateOnDuplicate: ['id'] },
            )
        })
        .catch(handleError)

    console.log(`mysql connected ${JSON.stringify(config('database'))}`)
    return ds
}
