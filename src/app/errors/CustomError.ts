export class CustomError extends Error {
    code: string;
    additionalInfo?: Record<string, any>;

    constructor(code: string, message: string, additionalInfo?:Record<string, any>) {
        super(message);
        this.code = code;
        this.additionalInfo = additionalInfo;
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}
