class UserRegistration {
    constructor(emailService) {
        this.emailService = emailService;
    }

    register(user) {
        if (!user.email) throw new Error('Email required');

        this.emailService.send(user.email, 'Welcome!', `Hi ${user.name}`);
        return { success: true, userId: 123 };
    }
}

module.exports = UserRegistration;



