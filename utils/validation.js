module.exports = (schema, data) => {
    const validation = schema.validate(data, { abortEarly: false, errors: {  label: false }})

    if (validation.error !== undefined) {
        const fieldErrors = {}
        validation.error.details.forEach(item => { fieldErrors[item.path] = [item.message] })
        return fieldErrors
    }
}