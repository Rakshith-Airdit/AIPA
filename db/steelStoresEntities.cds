namespace SteelStores;

using {AIPALocal.db.Associations as associations} from './associations';

entity SteelBendStores {
    key ID               : UUID;
        departmentID     : associations.DepartmentAssociation;
        formId           : associations.FormAssociation;
        storeUser        : associations.UserAssociation;
        wallThickness    : Integer;
        diameter         : String(50);
        lastConsumedDate : DateTime;
        createdDateTime  : DateTime;
        Manufacturer     : String(100);
        length           : Integer;
        coatingNumber    : Integer;
        heatNo           : Integer;
        Status           : String(20);
        isDeleted        : Boolean default false;
        Vendor           : String(100);
        consumedQuantity : Integer;
        assignedDate     : DateTime;
        formName         : String(50);
        Quantity         : Integer;
        angle            : String(100);
        bendNumber       : String(50);
        assetId          : String(100);
        Barcode          : String(50);
        projectId        : associations.ProjectAssociation;
        projectName      : String(100);
        departmentName   : String(100);
        slNo             : String(50);
}

entity SteelCapStores {
    key ID               : UUID;
        departmentID     : associations.DepartmentAssociation;
        formId           : associations.FormAssociation;
        storeUser        : associations.UserAssociation;
        diameter         : String(50);
        lastConsumedDate : DateTime;
        createdDateTime  : DateTime;
        status           : String(20);
        quantity         : Integer;
        manufacturer     : String(100);
        material         : String(100);
        capNo            : String(50);
        connectionType   : String(100);
        dateManufactured : String(20);
        isDeleted        : Boolean default false;
        vendor           : String(100);
        consumedQuantity : Integer;
        assignedDate     : DateTime;
        formName         : String(50);
        barcode          : String(50);
        assetId          : String(100);
        projectId        : associations.ProjectAssociation;
        projectName      : String(100);
        departmentName   : String(100);
}

entity SteelElbowStores {
    key ID               : UUID;
        departmentID     : associations.DepartmentAssociation;
        formId           : associations.FormAssociation;
        storeUser        : associations.UserAssociation;
        diameter         : String(50);
        lastConsumedDate : DateTime;
        createdDateTime  : DateTime;
        length           : String(50);
        coatingNumber    : String(50);
        heatNo           : String(50);
        status           : String(20);
        isDeleted        : Boolean default false;
        vendor           : String(100);
        consumedQuantity : Integer;
        assignedDate     : DateTime;
        formName         : String(50);
        quantity         : Integer;
        elbowNo          : String(50);
        systemType       : String(50);
        material         : String(100);
        manufacturer     : String(100);
        connectionType   : String(100);
        dateManufactured : String(20);
        assetId          : String(100);
        barcode          : String(50);
        projectId        : associations.ProjectAssociation;
        projectName      : String(100);
        departmentName   : String(100);
        slNo             : String(50);
        recordCreated    : Boolean;
}

entity SteelReducerStores {
    key ID               : UUID;
        departmentID     : associations.DepartmentAssociation;
        formId           : associations.FormAssociation;
        storeUser        : associations.UserAssociation;
        batchNo          : String(50);
        length           : String(50);
        wallThickness    : String(50);
        type             : String(50);
        material         : String(100);
        reducerNumber    : String(50);
        lastConsumedDate : DateTime;
        createdDateTime  : DateTime;
        manufacturer     : String(100);
        status           : String(50);
        isDeleted        : Boolean default false;
        vendor           : String(100);
        consumedQuantity : Integer;
        assignedDate     : DateTime;
        formName         : String(50);
        quantity         : String(50);
        size             : String(50);
        assetId          : String(100);
        barcode          : String(50);
        projectId        : associations.ProjectAssociation;
        projectName      : String(100);
        departmentName   : String(100);
        slNo             : String(50);
}

entity SteelTeeStores {
    key ID               : UUID;
        departmentID     : associations.DepartmentAssociation;
        formId           : associations.FormAssociation;
        storeUser        : associations.UserAssociation;
        batchNo          : String(50);
        wallThickness    : String(50);
        diameter         : String(50);
        lastConsumedDate : DateTime;
        createdDateTime  : DateTime;
        length           : String(50);
        coatingNumber    : String(50);
        heatNo           : String(50);
        consumedQuantity : Integer;
        assignedDate     : DateTime;
        formName         : String(50);
        status           : String(50);
        vendor           : String(100);
        isDeleted        : Boolean default false;
        teeNo            : String(50);
        type             : String(50);
        dateManufactured : String(20);
        connectionType   : String(100);
        material         : String(100);
        manufacturer     : String(100);
        quantity         : Integer;
        barcode          : String(50);
        assetId          : String(100);
        projectId        : associations.ProjectAssociation;
        projectName      : String(100);
        departmentName   : String(100);
        slNo             : String(50);
}

entity SteelValveStores {
    key ID               : UUID;
        departmentID     : associations.DepartmentAssociation;
        formId           : associations.FormAssociation;
        storeUser        : associations.UserAssociation;
        batchNo          : String(50);
        length           : String(50);
        wallThickness    : String(50);
        lastConsumedDate : DateTime;
        createdDateTime  : DateTime;
        consumedQuantity : Integer;
        assignedDate     : DateTime;
        formName         : String(50);
        status           : String(50);
        vendor           : String(100);
        isDeleted        : Boolean default false;
        type             : String(50);
        pressure         : String(50);
        material         : String(100);
        valveId          : Integer;
        quantity         : Integer;
        manufacturer     : String(100);
        barcode          : String(50);
        assetId          : String(100);
        projectId        : associations.ProjectAssociation;
        projectName      : String(100);
        departmentName   : String(100);
        slNo             : String(50);
}
