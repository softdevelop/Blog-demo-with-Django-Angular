export class User {
    id: number;
    email : string;
    firstName : string;
    image : string;
    is_superuser : string;
    lastName : string;
    token : string;
    userName : string;
    roles : any;
}


export class Notification {
    id: number;
    blog : string;
    user : string;
    comment : string;
}