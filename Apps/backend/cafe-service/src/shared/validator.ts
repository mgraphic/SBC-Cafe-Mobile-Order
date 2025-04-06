export class Validator {
    static email(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static phoneNumber(phone: string): boolean {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format
        return phoneRegex.test(phone);
    }

    static price(price: number): boolean {
        return typeof price === 'number' && price >= 0;
    }
}
