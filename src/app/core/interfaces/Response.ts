export interface ResponseI<T = any> {
    status: number;
    message: string;
    comment: string;
    data: T;
}