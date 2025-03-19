namespace AIPALocal.staticTypes;

type DepartmentInfo {
    departmentID   : UUID;
    departmentName : String(100);
}

type Steel {
    bend    : Integer;
    cap     : Integer;
    valve   : Integer;
    elbow   : Integer;
    reducer : Integer;
    tee     : Integer;
    pipe    : Integer;
}

type MDPE {
    serviceRegulator  : Integer;
    transitionFitting : Integer;
    tee               : Integer;
    saddle            : Integer;
    reducer           : Integer;
    pipe              : Integer;
    peValve           : Integer;
    mrs               : Integer;
    marker            : Integer;
    endCap            : Integer;
    drs               : Integer;
    coupler           : Integer;
    commercialMeters  : Integer;
    coil              : Integer;
    elbow             : Integer;
}

type QCStatus             : String enum {
    Revalidated;
    Resubmitted;
    Rejected;
    Approved;
}

type AdminType            : Integer enum {
    SuperUser            = 0;
    PowerUser            = 1;
    FieldUser            = 2;
    QualityUser          = 7;
    CorporateQualityUser = 7;
    StoreUser            = 8;
    BusinessUser         = 10;
    Unknown              = -1;
}

type AdminTypeString      : String enum {
    SuperUser;
    PowerUser;
    FieldUser;
    QualityUser;
    CorporateQualityUser;
    StoreUser;
    BusinessUser;
    Unknown;
}

type DeviceStatus         : String enum {
    Approved;
    Rejected;
}

type DistanceSetting {
    parameter   : String(100);
    description : String(255);
    value       : Decimal(10, 3);
}

type DepthSetting {
    parameter   : String(100);
    description : String(255);
    value       : Decimal(10, 3);
}

type BearingSetting {
    parameter   : String(100);
    description : String(255);
    value       : Decimal(10, 3);
}

type AccuracySetting {
    parameter   : String(100);
    description : String(255);
    value       : Decimal(10, 3);
}

type FormType             : String enum {
    ActivityForm;
    AssetsForm;
}

type ConsumptionStatus    : String enum {
    PartiallyConsumed;
    Consumed;
    Issued;
}

type assetType            : String enum {
    Steel;
    MDPE;
    Other;
}

type FieldTypes           : String enum {
    number;
    textbox;
    camera;
    signature;
    video;
    calendar;
    map;
    textarea;
}

type staticPageFieldNames : {
    FormszLogo           : String;
    MMLogo               : String;
    FieldonLogo          : String;
    nopreview            : String;
    ThinkgasLogo         : String;
    ThinkGasLogoWithName : String;
}