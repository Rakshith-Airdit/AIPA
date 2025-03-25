namespace AIPA;

service CommonServices {
    @cds.persistence.skip
    entity UserCount {
        key roles            : String;
            departments      : String;
            totalRoles       : Int32;
            totalDepartments : Int32;
            filterType       : String;
    }

    @cds.persistence.skip
    entity UserAttributes {
        key appId          : String;
            description    : String;
            icon           : String;
            UserName       : String;
            expanded       : Boolean;
            name           : String;
            email          : String;
            phone          : String;
            departmentName : String;
            role           : String;
            imageurl       : String;
            roles          : String;
            departmentId   : String;
            signurl        : String;
    }

    @cds.persistence.skip
    entity AllUserType {
        key name : String;
    }

    @cds.persistence.skip
    entity DepartmentDisplay {
        key id         : String;
            department : Map;
            userType   : Map;
    }

    @cds.persistence.skip
    entity Vendors {
        key name             : String;
            departmentName   : String;
            createdByEmailID : String;
            type             : String;
            shortname        : String;
            imagefilename    : String;
            img              : String;
            uniqueFields     : String;
            message          : String;
            totalCount       : String;
            data             : Integer;
    }

    @cds.persistence.skip
    entity Administrators {
        key username        : String;
            name            : String; // this is firstname;
            createdDateTime : String;
            lastname        : String;
            phone           : String;
            adminType       : String;
            departments     : Map;
            status          : String;
            imageurl        : String; // URL of the uploaded image
            imagefilename   : String; // Original filename of the image
            departmentName  : String;
            departmentId    : String;
            message         : String;
            signurl         : String
    }

// entity Test {
//     key data : many String;
// }
}
