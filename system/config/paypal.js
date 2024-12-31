module.exports = {
	mode: 'sandbox', //sandbox or live

    sandbox: {
        account: '',
        client_id: '',
        client_secret: ''
    },

    invoice: {
        merchant_info: {
            email: "root@localdomain.com",
            first_name: "",
            last_name: "",
            business_name: "Saas, Inc",
            phone: {
                country_code: "",
                national_number: ""
            },
            address: {
                line1: "1234 Main St.",
                city: "Portland",
                state: "OR",
                postal_code: "97217",
                country_code: "US"
            }
        },

        payment_term: {
            term_type: "NET_30"
        },

        tax_inclusive: false
    }
};