namespace MDPEStores;

using {AIPALocal.staticTypes as staticType} from './staticTypes';
using {AIPALocal.db.Associations as associations} from './associations';

entity MDPECoilStores {
    key ID               : UUID;
        formId           : associations.FormAssociation;
        departmentID     : associations.DepartmentAssociation;
        storeUser        : associations.UserAssociation;
        lastConsumedDate : DateTime;
        createdDateTime  : DateTime;
        status           : staticType.ConsumptionStatus;
        isDeleted        : Boolean default false;
        vendor           : String(255) default null;
        manufacturer     : String(255);
        consumedLength   : Integer;
        assignedDate     : DateTime;
        formName         : String(100);
        barcode          : String(100);
        projectId        : associations.ProjectAssociation;
        departmentName   : String(100);
        projectName      : String(100);
        diameter         : String(50);
        pipeLength       : Integer;
        coilBatchNumber  : String(100);
        assetId          : String(100);
        equipmentType    : String(50);
}

entity MDPECommercialMetersStores {
    key ID               : UUID;
        formId           : associations.FormAssociation;
        storeUserName    : associations.UserAssociation;
        vendorId         : String(50);
        lastConsumedDate : DateTime;
        createdDateTime  : DateTime;
        consumedQuantity : Integer;
        assignedDate     : DateTime;
        formName         : String(100);
        status           : staticType.ConsumptionStatus;
        vendor           : String(255);
        isDeleted        : Boolean default false;
        capacity         : String(50);
        size             : String(50);
        quantity         : Integer;
        meterNumber      : String(100);
        meterType        : String(50);
        manufacturer     : String(255);
        batchNumber      : String(100);
        barcode          : String(100);
        assetId          : String(100);
        projectName      : String(100);
        departmentID     : associations.DepartmentAssociation;
        departmentName   : String(100);
        projectId        : associations.ProjectAssociation;
}

entity MDPECouplerStores {
    key ID               : UUID;
        formId           : associations.FormAssociation;
        storeUserName    : associations.UserAssociation;
        projectId        : associations.ProjectAssociation;
        vendorId         : String(50);
        diameter         : String(50);
        lastConsumedDate : DateTime;
        createdDateTime  : DateTime;
        status           : staticType.ConsumptionStatus;
        isDeleted        : Boolean default false;
        vendor           : String(255);
        consumedQuantity : Integer;
        assignedDate     : DateTime;
        formName         : String(100);
        quantity         : Integer;
        manufacturer     : String(255);
        assetId          : String(100);
        barcode          : String(100);
        batchNumber      : Integer; // Renamed "Batch No/Lot No"
        projectName      : String(100);
        departmentID     : associations.DepartmentAssociation;
        departmentName   : String(100);
}

entity MDPEDRSStores {
    key ID               : UUID;
        formId           : associations.FormAssociation;
        storeUserName    : associations.UserAssociation;
        vendorId         : String(50);
        lastConsumedDate : DateTime;
        createdDateTime  : DateTime;
        consumedQuantity : Integer;
        assignedDate     : DateTime;
        formName         : String(100);
        status           : String(50);
        vendor           : String(255);
        isDeleted        : Boolean default false;
        batchNumber      : String(100); // Renamed "Batch Number/Lot No"
        quantity         : Integer;
        manufacturer     : String(255);
        barcode          : String(100);
        assetId          : String(100);
        projectId        : associations.ProjectAssociation;
        projectName      : String(100);
        departmentID     : associations.DepartmentAssociation;
        departmentName   : String(100);
}

entity MDPEElbowStores {
    key ID               : UUID;
        formId           : associations.FormAssociation;
        storeUserName    : associations.UserAssociation;
        vendorId         : String(50);
        lastConsumedDate : DateTime;
        createdDateTime  : DateTime;
        status           : staticType.ConsumptionStatus;
        isDeleted        : Boolean default false;
        vendor           : String(255);
        manufacturer     : String(255);
        assignedDate     : DateTime;
        formName         : String(100);
        quantity         : Integer;
        angle            : String(100);
        barcode          : String(100);
        projectId        : associations.ProjectAssociation;
        departmentID     : associations.DepartmentAssociation;
        departmentName   : String(100);
        projectName      : String(100);
        assetId          : String(100);
        batchNoLotNo     : String(100);
        diameter         : String(50);
        consumedQuantity : Integer;
}

entity MDPEEndCapStores {
    key ID               : UUID;
        formId           : associations.FormAssociation;
        storeUserName    : associations.UserAssociation;
        vendorId         : String(50);
        lastConsumedDate : DateTime;
        createdDateTime  : DateTime;
        status           : String(50);
        quantity         : Integer;
        manufacturer     : String(255);
        diameter         : String(50);
        isDeleted        : Boolean default false;
        vendor           : String(255);
        consumedQuantity : Integer;
        assignedDate     : DateTime;
        formName         : String(100);
        barcode          : String(100);
        assetId          : String(100);
        projectId        : associations.ProjectAssociation;
        batchNumber      : String(100);
        projectName      : String(100);
        departmentID     : associations.DepartmentAssociation;
        departmentName   : String(100);
}

entity MDPEMRSStores {
    key ID               : UUID;
        formId           : associations.FormAssociation;
        storeUserName    : associations.UserAssociation;
        vendorId         : String(50);
        lastConsumedDate : DateTime;
        createdDateTime  : DateTime;
        consumedQuantity : Integer;
        assignedDate     : DateTime;
        formName         : String(100);
        status           : String(50);
        vendor           : String(255);
        isDeleted        : Boolean default false;
        quantity         : Integer;
        serialNumber     : String(100);
        manufacturer     : String(255);
        batchNumber      : String(100);
        barcode          : String(100);
        assetId          : String(100);
        projectId        : associations.ProjectAssociation;
        projectName      : String(100);
        departmentID     : associations.DepartmentAssociation;
        departmentName   : String(100);
}

entity MDPEPEValveStores {
    key ID               : UUID;
        formId           : associations.FormAssociation;
        storeUser        : associations.UserAssociation;
        vendorId         : String(50);
        lastConsumedDate : DateTime;
        createdDateTime  : DateTime;
        consumedQuantity : Integer;
        assignedDate     : DateTime;
        formName         : String(100);
        status           : String(50);
        vendor           : String(100);
        isDeleted        : Boolean default false;
        size             : String(50);
        quantity         : Integer;
        manufacturer     : String(100);
        barcode          : String(100);
        assetId          : String(100);
        batchNoLotNo     : String(100);
        projectName      : String(100);
        departmentID     : associations.DepartmentAssociation;
        departmentName   : String(100);
        projectId        : associations.ProjectAssociation;
}

entity MDPEReducerStores {
    key ID               : UUID;
        formId           : associations.FormAssociation;
        storeUser        : associations.UserAssociation;
        vendorId         : String(50);
        size             : String(50);
        lastConsumedDate : DateTime;
        createdDateTime  : DateTime;
        status           : String(50);
        isDeleted        : Boolean default false;
        vendor           : String(100);
        consumedQuantity : Integer;
        assignedDate     : DateTime;
        formName         : String(100);
        quantity         : Integer;
        manufacturer     : String(100);
        assetId          : String(100);
        barcode          : String(100);
        batchNoLotNo     : String(100);
        projectId        : associations.ProjectAssociation;
        projectName      : String(100);
        departmentID     : associations.DepartmentAssociation;
        departmentName   : String(100);
        recordCreated    : Boolean;
}

entity MDPESaddleStores {
    key ID               : UUID;
        Manufacturer     : String(100);
        formId           : associations.FormAssociation;
        storeUser        : associations.UserAssociation;
        vendorId         : String(50);
        lastConsumedDate : DateTime;
        createdDateTime  : DateTime;
        Status           : String(20);
        isDeleted        : Boolean default false;
        Vendor           : String(100);
        consumedQuantity : Integer;
        assignedDate     : DateTime;
        formName         : String(50);
        Quantity         : Integer;
        Size             : String(50);
        Barcode          : String(50);
        assetId          : String(50);
        batchNumber      : String(50);
        projectName      : String(100);
        departmentID     : associations.DepartmentAssociation;
        departmentName   : String(100);
        projectId        : associations.ProjectAssociation;
}

entity MDPEServiceRegulatorStores {
    key ID               : UUID;
        formId           : associations.FormAssociation;
        storeUser        : associations.UserAssociation;
        vendorId         : String(50);
        lastConsumedDate : DateTime;
        createdDateTime  : DateTime;
        consumedQuantity : Integer;
        assignedDate     : DateTime;
        formName         : String(50);
        Status           : String(20);
        Vendor           : String(100);
        isDeleted        : Boolean default false;
        serialNumber     : String(50);
        Manufacturer     : String(100);
        Quantity         : Integer;
        Barcode          : String(50);
        assetId          : String(100);
        batchNumber      : String(50);
        projectName      : String(100);
        departmentID     : associations.DepartmentAssociation;
        departmentName   : String(100);
        projectId        : associations.ProjectAssociation;
}

entity MDPETeeStores {
    key ID               : UUID;
        formId           : associations.FormAssociation;
        storeUser        : associations.UserAssociation;
        vendorId         : String(50);
        lastConsumedDate : DateTime;
        createdDateTime  : DateTime;
        Manufacturer     : String(100);
        consumedQuantity : Integer;
        assignedDate     : DateTime;
        formName         : String(50);
        Status           : String(20);
        Vendor           : String(100);
        isDeleted        : Boolean default false;
        size             : String(50);
        Quantity         : Integer;
        Barcode          : String(50);
        assetId          : String(100);
        batchNumber      : String(50);
        projectName      : String(100);
        departmentID     : associations.DepartmentAssociation;
        departmentName   : String(100);
        projectId        : associations.ProjectAssociation;
}

entity MDPETransitionFittingStores {
    key ID               : UUID;
        formId           : associations.FormAssociation;
        vendorId         : String(50);
        lastConsumedDate : DateTime;
        createdDateTime  : DateTime;
        consumedQuantity : Integer;
        assignedDate     : DateTime;
        formName         : String(50);
        Status           : String(20);
        Vendor           : String(100);
        isDeleted        : Boolean default false;
        Quantity         : Integer;
        Manufacturer     : String(100);
        diameter         : String(50);
        Barcode          : String(50);
        assetId          : String(100);
        batchNumber      : String(50);
        projectId        : associations.ProjectAssociation;
        projectName      : String(100);
        departmentID     : associations.DepartmentAssociation;
        departmentName   : String(100);
}
