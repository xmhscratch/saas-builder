const Payment = require('../payment')

class Card extends Payment {

    constructor(paymentId, { organizationId }) {
        super(paymentId, { organizationId })
        return this
    }

    static async createNew(organizationId, {
        couponCode = null,
        grandTotal = 0.0000,
    }) {
        const paymentInfo = await super
            .createNew(organizationId, {
                method: 'directcard',
                couponCode,
                grandTotal,
            })
            .catch(handleError)

        const paymentId = paymentInfo.id
        const cardPaymentMethod = new Card(paymentId, { organizationId })

        const results = await cardPaymentMethod
            .createOrder(paymentInfo, { couponCode, grandTotal })
            .catch(handleError)

        await $.Wallet
            .createNew(organizationId, {
                id: `inv_${paymentInfo.reservedCode}-${paymentId}`,
                description: `Invoice #${paymentInfo.reservedCode}-${paymentId}`,
                balanceIncome: grandTotal,
                balanceOutcome: 0.0000,
            })
            .catch(handleError)

        return results
    }

    async createOrder(paymentInfo, {
        couponCode = null,
        grandTotal = 0.0000,
    }) {
        return
    }
}

module.exports = Card

// checkCard() {
//     var submitCardData = _.pick(req.body || {}, [
//         'type', 'number', 'first_name', 'last_name',
//         'cvv2', 'expire_month', 'expire_year'
//     ]);
//     //TODO: Add card validation

//     return req.paypal.credit_card.create(submitCardData, {}, (error, card) => {
//         if (error) {
//             console.error(error);
//             return res.status(404).end();
//         };

//         if (!card.id || _.isEqual(card.state, 'expired')) {
//             return res.status(404).end();
//         };

//         var cardModel = source.CreditCards.Model({
//             id: appl.helper('@string').randomString(24)
//         });
//         cardModel.save(submitCardData, { method: 'insert' });

//         return source.Users.Model
//             .forge({ id: req.session.authuser.id })
//             .getInfo()
//             .then(function (model) {
//                 if (!model) return res.status(404).end();
//                 return model.save({
//                     _card_id: card.id
//                 }).then(() => res.status(200).end())
//             });
//     });
// }
