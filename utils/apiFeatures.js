
class APIFeature {

    constructor(query, queryString) {
        this.query = query;
        this.queryStr = queryString;
    }

    filter() {
        const queryObj = { ...this.queryStr };
        const excludedFields = ['sort', 'limit', 'fields', 'page'];

        excludedFields.forEach(el => delete queryObj[el]);
        let queryStr = JSON.stringify(queryObj);
        console.log(queryStr);

        queryStr = queryStr.replace(/\b(gt|gte|lte|lt\b)/g, match => `$${match}`);

        // query build
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    sort() {
        if (this.queryStr.sort) {
            const sortBy = this.queryStr.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        }
        else {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    limitFields() {
        if (this.queryStr.fields) {
            const fields = this.queryStr.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    paginate() {
        const page = this.queryStr.page * 1 || 1;
        const limit = this.queryStr.limit * 1 || 100;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }

}

module.exports = APIFeature;