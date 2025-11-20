
class UserService {
    constructor(userRepo) {
        this.userRepo = userRepo;
    }

    registerUser(user) {
        const existing = this.userRepo.findByEmail(user.email);
        if (existing) throw new Error("Email already exists");

        return this.userRepo.save(user);
    }
}

module.exports = UserService;


