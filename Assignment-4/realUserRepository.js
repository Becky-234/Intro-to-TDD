
class RealUserRepository {
    constructor() {
        // pretend this is a real DB
    }

    save(user) {
        // imagine this writes to a real database
        console.log("Saving to database...");
    }

    findByEmail(email) {
        // imagine this queries the database
        return null;
    }
}

module.exports = RealUserRepository;


