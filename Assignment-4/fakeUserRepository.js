
class FakeUserRepository {
    constructor() {
        this.storage = [];    
    }

    save(user) {
        this.storage.push(user);
        return user;
    }

    findByEmail(email) {
        return this.storage.find(u => u.email === email) || null;
    }
}

module.exports = FakeUserRepository;


