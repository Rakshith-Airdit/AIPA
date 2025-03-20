namespace Common;

using {AIPALocal.staticTypes as staticType} from './staticTypes';
using {AIPALocal.db.Associations as associations} from './associations';

entity QCWorkflows {
    key ID                         : UUID;
        formID                     : associations.FormAssociation;
        recordID                   : String;
        projectID                  : associations.ProjectAssociation;
        reviewer                   : String(100);
        comments                   : String(255);
        signUrl                    : String(255);
        status                     : staticType.QCStatus;
        engineerRectificationSteps : Boolean default false;
        qualityRejection           : Boolean default false;
        dataRejection              : Boolean default false;
        reviewedDate               : DateTime;
}

entity OrganizationInfo {
    key ID              : UUID;
        staticPagesData : staticType.staticPageFieldNames;
}

entity RoleAssignment {
    key ID          : UUID;
        adminType   : staticType.AdminTypeString default #Unknown;
        allowedApps : Map;
}

entity DeviceManagement {
    key ID             : UUID;
        userID         : associations.UserAssociation;
        departmentID   : associations.DepartmentAssociation;
        departmentName : String(100);
        requestedUser  : String(100);
        UUID           : String(50);
        appVersion     : String(20);
        deviceType     : String(50);
        version        : String(20);
        platform       : String(50);
        macAddress     : String(50);
        model          : String(100);
        manufacturer   : String(100);
        fcmKey         : String(255);
        status         : staticType.DeviceStatus;
        createdTime    : DateTime;
        isDeleted      : Boolean default false;
        updatedTime    : DateTime;
        lastUpdated    : DateTime;
}

entity ExportFileDetails {
    key ID            : UUID;
        fileName      : String(255);
        userID        : associations.UserAssociation;
        type          : String(50);
        formName      : String(100);
        placeOfRecord : String(100);
        fromDate      : DateTime;
        toDate        : DateTime;
        users         : associations.UserAssociation;
        userType      : staticType.AdminType;
        taskName      : String(100);
        category      : String(100);
        size          : Double;
        downloadTime  : DateTime;
        typeOfRecord  : String(100);
}

entity VersionManagement {
    key ID                       : UUID;
        name                     : String(100);
        ownerMailId              : String(100);
        ownerName                : String(100);
        applicationType          : String(50);
        objectType               : String(50);
        description              : String(255);
        displayField             : LargeString;
        locationField            : LargeString;
        formSkeleton             : LargeString;
        isWholeSkeleton          : Boolean default false;
        isCreateNewForm          : Boolean default false;
        formType                 : String(50);
        lastModifiedDate         : DateTime;
        formSkeletonLevelChanges : LargeString;
        createdBy                : String(100);
        createdTime              : DateTime;
        formID                   : associations.FormAssociation;
        version                  : Integer;
        formUpdate               : String(50);
}

entity Settings {
    key ID                : UUID;
        androidAppVersion : String(10);
        iOSAppVersion     : Decimal(3, 1);
        idleTimeout       : Integer;
        accountLock       : Integer;
        lockInterval      : Integer;
        type              : String(50);
        minDistance       : staticType.DistanceSetting;
        maxDistance       : staticType.DistanceSetting;
        minDepthCapture   : staticType.DepthSetting;
        maxDepthCapture   : staticType.DepthSetting;
        minTrueBearing    : staticType.BearingSetting;
        maxTrueBearing    : staticType.BearingSetting;
        mobileGpsAccuracy : staticType.AccuracySetting;
}

entity AzureKey {
    key ID               : UUID;
        accountName      : String(100);
        accountKey       : String(255);
        connectionString : String(500);
        keyName          : String(100);
}

entity DocumentUploads {
    key ID             : UUID;
        size           : Double;
        downloadTime   : DateTime;
        fileName       : String(255);
        fileUrl        : String(500);
        uploadedBy     : String(100);
        mediaType      : String(100);
        documentType   : String(50);
        isDeleted      : Boolean default false;
        departmentName : String;
        types          : String;
        asset          : String;
        projectName    : String;
        recordID       : String;
}

entity AssetNetworks {
    key ID                   : UUID;
        date                 : DateTime;
        property_icon        : String(50);
        property_formName    : String(100);
        property_formId      : associations.FormAssociation;
        property_recordId    : String(50);
        property_projectName : String(100);
        property_accuracy    : Integer;
        property_projectId   : associations.ProjectAssociation;
        coordinates          : array of Decimal(10, 6);
        geometryType         : String(20);
        type                 : String(50);
        __v                  : Integer;
}

entity FormCollection {
    key ID             : UUID;
        formId         : associations.FormAssociation;
        objectType     : String(50) default '';
        type           : String(50) default '';
        collectionName : String(100) default '';
}


entity Notifications {
    key ID             : UUID;
        assignmentName : String(100);
        assignmentId   : Integer;
        taskName       : String(100);
        taskId         : Integer;
        user           : associations.UserAssociation;
        actionType     : String(255);
        status         : Boolean;
        createdTime    : DateTime;
        projectID      : associations.ProjectAssociation;
}

entity AssetsExcelSheets {
    key ID          : UUID;
        fileId      : String(100);
        assetType   : staticType.assetType;
        contentType : String(100);
        filename    : String(255);
        fileurl     : String(255);
        __v         : Integer;
}

entity storeSignature {
    key ID          : UUID;
        fileID      : String;
        data        : LargeString;
        contentType : String;
        __v         : Integer;
}

entity userType {
    key ID   : UUID;
        name : String;
        type : Integer;
}

entity ActivityLogs {
    key ID              : UUID;
        formDescription : String(255);
        version         : String(50);
        taskName        : String(100);
        taskID          : String(50);
        deviceModel     : String(100);
        source          : String(100);
        formID          : associations.FormAssociation;
        username        : String(100);
        deviceUUID      : String(50);
        adminName       : String(100);
        formName        : String(100);
        recordID        : String;
        department      : associations.DepartmentAssociation;
        activity        : String(255);
        timestamp       : DateTime;
        isDeleted       : Boolean default false;
        departmentName  : String;
}

entity Departments {
    key ID              : UUID;
    key name            : String(100);
        postalCode      : String(20);
        applicationType : String(50);
        description     : String(255);
        createdDateTime : DateTime;
        isDeleted       : Boolean default false;
}

entity FieldDetails {
    key ID                    : UUID;
        fieldId               : String(50) default '';
        label                 : String(100) default '';
        isRequired            : Boolean default false;
        placeholder           : String(255) default '';
        size                  : Integer default 0;
        defaultValue          : String(255) default '';
        minLength             : Integer default 0;
        maxLength             : Integer default 0;
        isInputAllowDecimals  : Boolean default false;
        type                  : String(50) default '';
        isUnderHeading        : String(255) default '';
        isDependentField      : Boolean default false;
        disabled              : Boolean default false;
        displayName           : String(255) default '';
        typeChange            : String(255) default '';
        formId                : associations.FormAssociation;
        position              : Integer default 0;
        minValue              : Integer default 0;
        maxValue              : Integer default 0;
        form                  : String(50) default '';
        imageSize             : String default '';
        videoDuration         : String default '';
        isPrimary             : Boolean default false;
        maxDate               : DateTime @cds.on.insert: $now;
        minDate               : DateTime @cds.on.insert: $now;
        minInputVal           : Integer default 0;
        maxInputVal           : Integer default 0;
        typeOfDateSelected    : String default '';
        gpsMode               : Map;
        isAllowMultiSelection : Boolean default false;
        options               : array of String;
        disableOnEdit         : Boolean default false;
}

entity Forms {
    key ID                   : UUID;
        name                 : String(255)           @mandatory;
        objectType           : String(50) default '';
        workInstruction      : String(500) default '';
        lastModifiedDate     : DateTime default $now @cds.on.update: $now;
        lastModifiedBy       : String(100) // @cds.on.insert: $user // @cds.on.update: $user
        ;
        description          : String(500) default '';
        createdBy            : String(100) // @cds.on.insert: $user // @cds.on.update: $user
        ;
        createdTime          : DateTime default $now @cds.on.insert: $now;
        isRuleDefined        : Boolean default false;
        ownerMailId          : String(100) default '';
        ownerName            : String(100) default '';
        isGeoDataAvailable   : Boolean default false;
        displayField         : Map // @cds.default  : '{}'
        ;
        dependentFields      : array of String //@cds.default  : '[]'
        ;
        allocatedCategories  : array of String //@cds.default  : '[]'
        ;
        allocatedDepartments : array of String //@cds.default  : '[]'
        ;
        formType             : String;
        typeOfForm           : staticType.FormType default #ActivityForm;
}

entity Projects {
    key ID                    : UUID;
        type                  : String(50);
        steel                 : staticType.Steel;
        mdpe                  : staticType.MDPE;
        name                  : String(100) not null;
        shortName             : String(50);
        chainageFrom          : String(50);
        chainageTo            : String(50);
        poNumber              : String(50);
        estimatedEndDate      : DateTime;
        estimatedStartDate    : DateTime;
        startDate             : DateTime;
        endDate               : DateTime;
        pmcNo                 : String(50);
        clientNo              : Map;
        contractorNo          : Map;
        projectLength         : Integer;
        pipeDiameter          : String(50);
        networkComprise       : Map;
        chargeArea            : String(50);
        grade                 : String(50);
        referenceProject      : String(100);
        ndtAgency             : String(100);
        pressure              : String(50);
        description           : String(255);
        users                 : associations.UserAssociation;
        equipmentType         : Map;
        efMachineSerialNumber : String;
        department            : associations.DepartmentAssociation;
        departmentName        : String;
        createdBy             : String(100);
        createdByMailID       : String(100);
        isDeleted             : Boolean default false;
        reportUpdates         : Boolean default false;
        sequenceId            : String;
        geoJSON               : Map;
        workInstruction       : String;
        isAllowMap            : Boolean default false;
        assigned              : array of String;
        assignedGroupAdmin    : array of String;
        assignedForms         : array of String;
        assignedUsers         : array of String;
        statusOfTheTask       : String;
        workFlowStatus        : String;
        workFlowAssignedBy    : Map;
        workFlowName          : String;
        workFlowAssignedTo    : String;
        workAssignmentLevel   : Integer;
        IsReassign            : Boolean default false;
        Date                  : Date;
        Comments              : String;
        formzCategory         : array of String;
        isPreppopAttached     : Boolean default false;
        taskType              : Boolean default false;
        lastDataReqTime       : DateTime;
        isClosed              : Boolean default false;
        isAllowedMap          : Boolean default false;
        popNumber             : String;
        createdTimeStamp      : DateTime;
        projectID             : associations.ProjectAssociation;
        update                : Map;
        updateProject         : Map;
}

entity RedFlagRules {
    key ID               : UUID;
        form             : associations.FormAssociation;
        operation        : String(50);
        projectType      : String(50);
        widgetId         : String(100);
        compareType      : String(50);
        value            : array of String;
        isActive         : Boolean default true;
        isDeleted        : Boolean default false;
        createdDateTime  : DateTime;
        uniqueID         : String; // Id renamed as UniqueID
        lastModifiedDate : DateTime;
        formID           : associations.FormAssociation;
}

entity Users {
    key ID                                : UUID;
        departments                       : associations.DepartmentAssociation;
        isDeleted                         : Boolean default false;
        adminType                         : staticType.AdminTypeString default #Unknown;
        privilege                         : Map;
        imageUrl                          : String(255) default '';
        isUserLocatorActive               : Boolean default false;
        selectedGroupList                 : array of String;
        isUserUpdatePermissionActive      : Boolean default false;
        admingroup                        : String(50) default '';
        assignedLayers                    : array of String;
        zone                              : String(50) default '';
        adminlist                         : array of String;
        createdBy                         : String(100) default '';
        createdByMailID                   : String(100) default '';
        isFirstLogin                      : Boolean default false;
        deviceDetails                     : array of String;
        lastLoggedInTime                  : DateTime @cds.on.insert: $now;
        UserName                          : String(100) default '';
        type                              : Integer default 0;
        password                          : String(255) default '';
        doj                               : DateTime @cds.on.insert: $now;
        dob                               : DateTime @cds.on.insert: $now;
        createdDateTime                   : DateTime @cds.on.insert: $now;
        accountLockedOn                   : DateTime @cds.on.insert: $now;
        numberOfAttemptsWithWrongPassword : Integer default 0;
        isAccountLocked                   : Boolean default false;
        email                             : String(100) default '';
        name                              : String(100) default '';
        lastName                          : String(100) default '';
        phone                             : String(20) default '';
        signUrl                           : String(255) default '';
        vendor                            : associations.VendorAssociation;
        imagefilename                     : String(255) default '';
}

entity Vendors {
    key ID               : UUID;
    key name             : String(100) not null;
        shortName        : String(50);
        type             : String(50);
        createdByEmailID : String(100);
        department       : associations.DepartmentAssociation;
        imageFileName    : String(255);
        img              : String(255);
        isDeleted        : Boolean default false;
}
