namespace AIPA;

using {Common} from '../db/common';

service CommonServices {
    // entity Users       as projection on Common.Users;
    // entity Departments as projection on Common.Departments;

    entity UserCount {
        data : String;
    }
}
