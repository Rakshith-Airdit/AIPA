namespace MDPE;

using {AIPALocal.db.Associations as associations} from './associations';

entity MDPECommercialMeters {
    key ID                    :      UUID;
        assetId               :      String(100);
        installationDate      :      String(50);
        batchNumber           :      String(100);
        attachment            :      String(255);
        size                  :      String(50);
        manufacturer          :      String(255);
        capacity              :      String(50);
        meterNumber           :      String(100);
        regulatorSize         :      String(50);
        regulatorManufacturer :      String(255);
        commissionDate        :      String(50);
        meterType             :      String(50);
        redFlags              : many String; // JSON array stored as string
        projectId             :      associations.ProjectAssociation;
        submittedBy           :      String(100);
        formId                :      associations.FormAssociation;
        formName              :      String(100);
        submissionType        :      String(100);
        displayName           :      Map; // Storing JSON array as a string
        equipmentType         :      String; // Storing JSON array as a string
        serverUniqueId        :      String(100);
        uniqueId              :      String(100);
        lastUpdatedDate       :      DateTime;
        status                :      String;
        recordId              :      String;
        submittedTime         :      DateTime;
        isDeleted             :      Boolean default false;
        qaQcStatus            :      String(50); // Renamed "QA/QC Status" to a valid field name
        lastUpdatedBy         :      String(100);
        latestApprovalDate    :      DateTime;
        projectName           :      String(100);
        departmentID          :      associations.DepartmentAssociation;
        departmentName        :      String(100);
        Id_5665397859         :      String;
        Id_1001083765         :      String;
        Id_6663305034         :      String;
}

entity MDPECoupler {
    key ID                      :      UUID;
        formName                :      String(100);
        formId                  :      associations.FormAssociation;
        assetId                 :      String(100);
        installationDate        :      DateTime;
        attachment              :      String(255);
        manufacturer            :      String(255);
        electroFusionJoinNumber :      String(100);
        heatingTimeSec          :      Integer;
        coolingTimeMin          :      Integer;
        temperature             :      Integer;
        electroFusionMachine    :      String(50);
        Id_4335973301           :      String;
        imageUrl                :      String(500); // URL for image attachment
        diameter                :      String(50);
        efMachineSerialNumber   :      String(100);
        redFlags                : many String; // JSON array stored as string
        projectId               :      associations.ProjectAssociation;
        submittedBy             :      String(100);
        submissionType          :      String(100);
        displayName             :      Map;
        equipmentType           :      String(100);
        serverUniqueId          :      String(100);
        uniqueId                :      String(100);
        lastUpdatedDate         :      DateTime;
        status                  :      String(50);
        recordId                :      String;
        submittedTime           :      DateTime;
        isDeleted               :      Boolean default false;
        qaQcStatus              :      String(50); // Renamed "QA/QC Status" to a valid field name
        lastUpdatedBy           :      DateTime;
        latestApprovalDate      :      DateTime;
        batchNumber             :      String(100); // Renamed "Batch No/Lot No" to batchNumber
        projectName             :      String(100);
        departmentID            :      associations.DepartmentAssociation;
        departmentName          :      String(100);
        pipeOD                  :      String;
        modelNo                 :      String;
        calibrationDueDate      :      Date;
        jointNo                 :      String;
        welderName              :      String;
        visualObservation       :      String;
        location                :      String;
        Make                    :      String;
        alignmentClampUsed      :      String;
        MachineSlNo             :      Integer;
        Id_80435327341000000000 :      String;
        pipeFittingDetail       :      String;
        Pipe                    :      Map;
}

entity MDPECustomer {
    key ID                 :      UUID;
        customerName       :      String(100);
        applicationNo      :      String(50);
        address            :      String(255);
        contactNo          :      String(20);
        customerType       :      String(50);
        primaryLocation    :      String(100); // GPS coordinates
        secondaryLocation  :      String(100); // GPS coordinates
        meterType          :      String(50);
        meterSerialNumber  :      String(50);
        connectionDate     :      DateTime;
        redFlags           : many String; // JSON array stored as string
        projectId          :      associations.ProjectAssociation;
        submittedBy        :      String(100);
        formId             :      associations.FormAssociation;
        formName           :      String(100);
        submissionType     :      String(100);
        displayName        :      Map; // Storing JSON array as a string
        equipmentType      :      array of String; // Storing JSON array as a string
        serverUniqueId     :      String(100);
        uniqueId           :      String(100);
        lastUpdatedDate    :      DateTime;
        status             :      String;
        recordId           :      String;
        submittedTime      :      DateTime;
        isDeleted          :      Boolean default false;
        qaQcStatus         :      String(50); // Renamed "QA/QC Status" to a valid field name
        lastUpdatedBy      :      String(100);
        projectName        :      String(100);
        departmentID       :      associations.DepartmentAssociation;
        departmentName     :      String(100);
        Id_2719865553      :      String;
        Id_9179022765      :      String;
        Id_1359674306      :      String;
        Id_2585145028      :      String;
        Id_4586392219      :      String;
        Id_5589800246      :      String;
        Id_6333425065      :      String;
        Id_3622406322      :      String;
        Id_3564844272      :      String;
        Id_4965073140      :      String;
        Id_8543292807      :      String;
        latestApprovalDate :      DateTime;
}

entity MDPEDCU {
    key ID                 : UUID;
        assetId            : String(100);
        installationDate   : String(50);
        manufacturer       : String(255);
        skidNo             : String(50);
        capacity           : String(50);
        commissioningDate  : String(50);
        enclosureType      : String(100);
        gaName             : String(100);
        imageUrl           : String(500);
        redFlags           : LargeString; // JSON array stored as string
        uniqueId           : String(100);
        projectId          : associations.ProjectAssociation;
        status             : String;
        submittedBy        : String(100);
        formId             : associations.FormAssociation;
        formName           : String(100);
        serverUniqueId     : String(100);
        displayName        : Map; // Storing JSON array as a string
        equipmentType      : LargeString; // Storing JSON array as a string
        lastUpdatedDate    : DateTime;
        recordId           : String;
        submittedTime      : DateTime;
        isDeleted          : Boolean default false;
        qaQcStatus         : String(50); // Renamed "QA/QC Status" to a valid field name
        lastUpdatedBy      : String(100);
        projectName        : String(100);
        departmentID       : associations.DepartmentAssociation;
        departmentName     : String(100);
        location           : String(100);
        Id_9990458891      : String;
        Id_5890571136      : String;
        Id_5637776338      : String;
        Id_1501746382      : String;
        Id_6377765152      : String;
        Id_3880498870      : String;
        Id_1000265352      : String;
        Id_8737724604      : String;
        Id_4769049240      : String;
        Id_8597444848      : String;
        Id_3648365666      : String;
        Id_1622895552      : String;
        Id_8584987161      : String;
        Id_7576369006      : String;
        pipeOD             : String;
        modelNo            : String;
        calibrationDueDate : DateTime;
        jointNo            : String;
        welderName         : String;
        visualObservation  : String;
        make               : String;
        alignmentClampUsed : String;
        MachineSlNo        : String;
}

entity MDPEDRS {
    key ID                 :      UUID;
        assetId            :      String(100);
        installationDate   :      String(50);
        batchNumber        :      String(100);
        attachment         :      String(255);
        manufacturer       :      String(255);
        drsMake            :      String(100);
        capacity           :      String(50);
        dataLoggerMake     :      String(100);
        filterMake         :      String(100);
        filterType         :      String(100);
        commissioningDate  :      String(50);
        placementLocation  :      String(255);
        imageUrl           :      String(500); // URL for image attachment
        redFlags           : many String; // JSON array stored as string
        projectId          :      associations.ProjectAssociation;
        submittedBy        :      String(100);
        formId             :      associations.FormAssociation;
        formName           :      String(100);
        submissionType     :      String(100);
        displayName        :      Map; // Storing JSON array as a string
        equipmentType      :      LargeString; // Storing JSON array as a string
        serverUniqueId     :      String(100);
        uniqueId           :      String(100);
        lastUpdatedDate    :      DateTime;
        status             :      String;
        recordId           :      String;
        submittedTime      :      DateTime;
        isDeleted          :      Boolean default false;
        qaQcStatus         :      String(50); // Renamed "QA/QC Status" to a valid field name
        lastUpdatedBy      :      String(100);
        latestApprovalDate :      DateTime;
        projectName        :      String(100);
        departmentID       :      associations.DepartmentAssociation;
        departmentName     :      String(100);
        Id_1500768452      :      String;
        Id_6721572552      :      String;
}

entity MDPEDailyCommentsOptional {
    key ID                 :      UUID;
        comments           :      String(500);
        date               :      String(50);
        redFlags           : many String; // JSON array stored as string
        projectId          :      associations.ProjectAssociation;
        submittedBy        :      String(100);
        formId             :      associations.FormAssociation;
        formName           :      String(100);
        submissionType     :      String(100);
        displayName        :      Map; // Storing JSON array as a string
        equipmentType      :      LargeString; // Storing JSON array as a string
        serverUniqueId     :      String(100);
        uniqueId           :      String(100);
        lastUpdatedDate    :      DateTime;
        status             :      String;
        recordId           :      String;
        submittedTime      :      DateTime;
        isDeleted          :      Boolean default false;
        qaQcStatus         :      String(50); // Renamed "QA/QC Status" to a valid field name
        lastUpdatedBy      :      String(100);
        latestApprovalDate :      DateTime;
        projectName        :      String(100);
        departmentID       :      associations.DepartmentAssociation;
        departmentName     :      String(100);
}

entity MDPEElbow {
    key ID                      :      UUID;
        assetId                 :      String(100);
        angle                   :      String(100);
        dateInstalled           :      Date;
        attachment              :      String(255);
        diameter                :      String(50);
        heatingTime             :      Integer;
        coolingTime             :      Integer;
        temperature             :      String(50);
        electroFusionMachine    :      String(100);
        manufacturer            :      String(255);
        efMachineSerialNumber   :      Integer;
        batchNumber             :      String(100);
        redFlags                : many String; // JSON array stored as string
        uniqueId                :      String(100);
        projectId               :      associations.ProjectAssociation;
        status                  :      String;
        submittedBy             :      String(100);
        formId                  :      associations.FormAssociation;
        formName                :      String(100);
        serverUniqueId          :      String(100);
        displayName             :      Map; // Storing JSON array as a string
        equipmentType           :      array of String; // Storing JSON array as a string
        lastUpdatedDate         :      DateTime;
        recordId                :      String;
        submittedTime           :      DateTime;
        isDeleted               :      Boolean default false;
        qaQcStatus              :      String(50); // Renamed "QA/QC Status" to a valid field name
        latestApprovalDate      :      DateTime;
        projectName             :      String(100);
        departmentID            :      associations.DepartmentAssociation;
        departmentName          :      String(100);
        alignmentClampUsed      :      Boolean default false;
        calibrationDueDate      :      DateTime;
        Id_7795379294           :      String;
        Id_48504245821000000000 :      String;
        jointNo                 :      String;
        location                :      String;
        MachineSlNo             :      String;
        make                    :      String;
        modelNo                 :      String;
        pipeFittingDetail       :      String;
        pipeOD                  :      String;
        visualObservation       :      String;
        welderName              :      String;
}

entity MDPEEndCap {
    key ID                      :      UUID;
        assetId                 :      String(100);
        installationDate        :      String(50);
        attachment              :      String(255);
        diameter                :      String(50);
        manufacturer            :      String(255);
        electroFusionJoinNumber :      String(50);
        heatingTime             :      Integer;
        coolingTime             :      Integer;
        temperature             :      String(50);
        electroFusionMachine    :      String(100);
        efMachineSerialNumber   :      String(100);
        batchNumber             :      String(100);
        redFlags                : many String; // JSON array stored as string
        projectId               :      associations.ProjectAssociation;
        submittedBy             :      String(100);
        formId                  :      associations.FormAssociation;
        formName                :      String(100);
        submissionType          :      String(100);
        displayName             :      Map; // Storing JSON array as a string
        equipmentType           :      LargeString; // Storing JSON array as a string
        serverUniqueId          :      String(100);
        uniqueId                :      String(100);
        lastUpdatedDate         :      DateTime;
        status                  :      String;
        recordId                :      String;
        submittedTime           :      DateTime;
        isDeleted               :      Boolean default false;
        qaQcStatus              :      String(50); // Renamed "QA/QC Status" to a valid field name
        projectName             :      String(100);
        departmentID            :      associations.DepartmentAssociation;
        departmentName          :      String(100);
        pipeOD                  :      String;
        modelNo                 :      String;
        calibrationDueDate      :      DateTime;
        jointNo                 :      String;
        welderName              :      String;
        visualObservation       :      String;
        location                :      String;
        make                    :      String;
        alignmentClampUsed      :      String;
        machineSerialNumber     :      String;
        pipeFittingDetail       :      String;
        Id_1754615501000000000  :      String;
        Id_3154720241           :      String;
        pipeO                   :      String;
        geoData                 :      Map;
}

entity MDPEIMSMRS {
    key ID                 :      UUID;
        name               :      String(100);
        assetId            :      String(100);
        installationDate   :      DateTime;
        batchNumber        :      String(100);
        commissioningDate  :      DateTime;
        attachment         :      String(255);
        size               :      String(50);
        serialNumber       :      String(100);
        manufacturer       :      String(255);
        meterMake          :      String(100);
        capacity           :      String(100);
        evcSerialNumber    :      String(100);
        evcMake            :      String(100);
        placementLocation  :      String(255);
        meterType          :      String(50);
        redFlags           : many String; // JSON array stored as string
        projectId          :      associations.ProjectAssociation;
        submittedBy        :      String(100);
        formId             :      associations.FormAssociation;
        formName           :      String(100);
        submissionType     :      String(100);
        displayName        :      Map; // Storing JSON array as a string
        equipmentType      :      LargeString; // Storing JSON array as a string
        serverUniqueId     :      String(100);
        uniqueId           :      String(100);
        lastUpdatedDate    :      DateTime;
        status             :      String;
        recordId           :      String;
        submittedTime      :      DateTime;
        isDeleted          :      Boolean default false;
        qaQcStatus         :      String(50); // Renamed "QA/QC Status" to a valid field name
        lastUpdatedBy      :      String(100);
        latestApprovalDate :      DateTime;
        projectName        :      String(100);
        departmentID       :      associations.DepartmentAssociation;
        departmentName     :      String(100);
        Id_2829648706      :      String;
        Id_5704861248      :      String;
        Id_1348841832      :      String;
        Id_1260095428      :      String;
}

entity MDPEMarker {
    key ID                 :      UUID;
        installationDate   :      DateTime;
        type               :      String(50);
        attachment         :      String(255);
        Id_1643437894      :      String(255);
        redFlags           : many String; // JSON array stored as string
        projectId          :      associations.ProjectAssociation;
        submittedBy        :      String(100);
        formId             :      associations.FormAssociation;
        formName           :      String(100);
        submissionType     :      String(100);
        displayName        :      Map; // Storing JSON array as a string
        equipmentType      :      LargeString; // Storing JSON array as a string
        serverUniqueId     :      String(100);
        uniqueId           :      String(100);
        lastUpdatedDate    :      DateTime;
        status             :      String;
        recordId           :      String;
        submittedTime      :      DateTime;
        isDeleted          :      Boolean default false;
        qaQcStatus         :      String(50); // Renamed "QA/QC Status" to a valid field name
        lastUpdatedBy      :      String(100);
        latestApprovalDate :      DateTime;
        projectName        :      String(100);
        departmentID       :      associations.DepartmentAssociation;
        departmentName     :      String(100);
}

entity MDPEPEValve {
    key ID                      :      UUID;
        assetId                 :      String(100);
        installationDate        :      DateTime;
        attachment              :      String(255);
        Id_5157525044           :      String(255);
        size                    :      String(50);
        manufacturer            :      String(100);
        leakDetectionTest       :      String(100);
        chamber                 :      String(100);
        valveNumber             :      String(50);
        placementLocation       :      String(255);
        electroFusionJoinNumber :      String(50);
        heatingTimeSec          :      String(20);
        coolingTimeMin          :      String(20);
        temperature             :      String(20);
        electroFusionMachine    :      String(100);
        Id_7264333535           :      String(255);
        efMachineSerialNumber   :      String(50);
        redFlags                : many String; // JSON array stored as string
        projectId               :      associations.ProjectAssociation;
        submittedBy             :      String(100);
        formId                  :      associations.FormAssociation;
        formName                :      String(100);
        submissionType          :      String(100);
        displayName             :      Map; // Storing JSON array as a string
        equipmentType           :      LargeString; // Storing JSON array as a string
        serverUniqueId          :      String(100);
        uniqueId                :      String(100);
        lastUpdatedDate         :      DateTime;
        status                  :      String;
        recordId                :      String;
        submittedTime           :      DateTime;
        isDeleted               :      Boolean default false;
        qaQcStatus              :      String(50); // Renamed "QA/QC Status" to a valid field name
        lastUpdatedBy           :      String(100);
        batchNoLotNo            :      String(100);
        projectName             :      String(100);
        departmentID            :      associations.DepartmentAssociation;
        departmentName          :      String(100);
        pipeOD                  :      String(255);
        modelNo                 :      String(255);
        calibrationDueDate      :      DateTime;
        jointNo                 :      String(255);
        welderName              :      String(255);
        visualObservation       :      String(255);
        location                :      String(255);
        make                    :      String(255);
        alignmentClampUsed      :      Boolean default false;
        machineSerialNumber     :      String;
}

entity MDPEPipe {
    key ID                            : UUID;
        coilBatchNumber               : String(100);
        diameter                      : String(50);
        consumedLength                : Integer;
        installedDate                 : DateTime;
        topCoverAvgInMeter            : Integer;
        openCutLength                 : Integer;
        molingLength                  : Integer;
        hddLength                     : Integer;
        warningMatLength              : Integer;
        nitroPurgingCommissioning     : String(100);
        nitroPurgingCommissioningDate : DateTime;
        flushingCleaning              : DateTime;
        testingDate                   : DateTime;
        areaLocation                  : String(255);
        halfRoundRccHumePipeUsed      : String(100);
        manufacturer                  : String(100);
        projectId                     : associations.ProjectAssociation;
        status                        : String;
        submittedBy                   : String(100);
        formId                        : associations.FormAssociation;
        formName                      : String(100);
        lastUpdatedDate               : DateTime;
        recordId                      : String;
        submittedTime                 : DateTime;
        isDeleted                     : Boolean default false;
        qaQcStatus                    : String(50);
        projectName                   : String(100);
        departmentID                  : associations.DepartmentAssociation;
        departmentName                : String(100);
        geoData                       : Map;
        Id_3482343707                 : String(255);
        Id_6572230564                 : String(255);
        Id_7270622184                 : String(255);
        Id_8931399217                 : String(255);
        Location_1919882321           : String(255);
        Location_2756574979           : String(255);
        intermediateCoordinates       : array of Decimal;
        additionalProtection          : String(255);
        additionalProtectionPhoto     : String(255);
        casing                        : String(255);
        casingPhoto                   : String(255);
        attachment                    : String(255);
        flushingPhoto                 : String(255);
        flushingCleaningTesting       : String(255);
        attachments                   : String(255);
        fullRoundRccHumePipeUsed      : String(255);
        redFlags                      : LargeString;
        uniqueId                      : String;
        serverUniqueId                : String;
        displayName                   : Map;
        equipmentType                 : array of String;
}

entity MDPEReducer {
    key ID                             : UUID;
        assetId                        : String(100);
        installationDate               : DateTime;
        size                           : String(50);
        manufacturer                   : String(100);
        batchNoLotNo                   : String(100);
        electroFusionJoinNumber        : String(50);
        heatingTimeSec                 : Integer;
        coolingTimeMin                 : Integer;
        temperature                    : String(50);
        electroFusionMachine           : String(100);
        efMachineSerialNumber          : String(100);
        alignmentClampUsed             : String(50);
        calibrationDueDate             : DateTime;
        jointNo                        : String(100);
        location                       : String(255);
        machineSerialNumber            : String(100);
        make                           : String(100);
        modelNo                        : String(100);
        pipeFittingDetail              : String(255);
        pipeOD                         : String(100);
        visualObservation              : String(255);
        welderNameTrainingValidityDate : String(100);
        attachment                     : String(255);
        projectId                      : associations.ProjectAssociation;
        status                         : String;
        submittedBy                    : String(100);
        formId                         : associations.FormAssociation;
        formName                       : String(100);
        lastUpdatedDate                : DateTime;
        recordId                       : String;
        submittedTime                  : DateTime;
        isDeleted                      : Boolean default false;
        qaQcStatus                     : String(50);
        projectName                    : String(100);
        departmentID                   : associations.DepartmentAssociation;
        departmentName                 : String(100);
        redFlags                       : LargeString;
        submissionType                 : String;
        displayName                    : Map;
        equipmentType                  : String;
        serverUniqueId                 : Double;
        uniqueId                       : String;
}

entity MDPESaddle {
    key ID                      :      UUID;
        assetId                 :      String(100);
        installationDate        :      DateTime;
        attachment              :      String(255);
        size                    :      String(50);
        electroFusionJoinNumber :      String(100);
        heatingTimeSec          :      Integer;
        coolingTimeMin          :      Integer;
        temperature             :      Integer;
        electroFusionMachine    :      String(100);
        manufacturer            :      String(100);
        efMachineSerialNumber   :      String(100);
        redFlags                : many String;
        projectId               :      associations.ProjectAssociation;
        submittedBy             :      String(100);
        formId                  :      associations.FormAssociation;
        formName                :      String(100);
        submissionType          :      String(100);
        equipmentType           :      String(100);
        serverUniqueId          :      String(100);
        uniqueId                :      String(100);
        lastUpdatedDate         :      DateTime;
        status                  :      String;
        recordId                :      String;
        submittedTime           :      DateTime;
        isDeleted               :      Boolean default false;
        qaQcStatus              :      String(50);
        lastUpdatedBy           :      String(100);
        latestApprovalDate      :      DateTime;
        batchNoLotNo            :      String(100);
        projectName             :      String(100);
        departmentID            :      associations.DepartmentAssociation;
        departmentName          :      String(100);
        displayName             :      Map;
        pipeOD                  :      String;
        modelNo                 :      String;
        calibrationDueDate      :      DateTime;
        jointNo                 :      String;
        welderName              :      String;
        visualObservation       :      String;
        location                :      String;
        make                    :      String;
        alignmentClampUsed      :      String;
        machineSerialNumber     :      String;
        Id_88953023351000000000 :      String;
        Id_5416048700           :      String;
        pipeFittingDetail       :      String;
}

entity MDPEServiceRegulator {
    key ID                      :      UUID;
        assetId                 :      String(100);
        size                    :      String(50);
        installationDate        :      String(20);
        serialNumber            :      String(50);
        Manufacturer            :      String(100);
        leakDetectionTest       :      String(20);
        foundation              :      String(20);
        placementLocation       :      String(100);
        regulatorMake           :      String(100);
        electroFusionJoinNumber :      String(50);
        heatingTime             :      Integer;
        coolingTime             :      Integer;
        temperature             :      String(20);
        electroFusionMachine    :      String(50);
        ID_1487123812           :      String(255);
        ID_9330461117           :      String(255);
        attachment              :      String(255);
        efMachineSerialNumber   :      String(50);
        redFlags                : many String;
        projectId               :      associations.ProjectAssociation;
        submittedBy             :      String(100);
        formId                  :      associations.FormAssociation;
        formName                :      String(50);
        submissionType          :      String(50);
        equipmentType           :      String(50);
        serverUniqueId          :      Integer;
        uniqueId                :      String(100);
        lastUpdatedDate         :      DateTime;
        status                  :      String;
        recordId                :      String;
        submittedTime           :      DateTime;
        isDeleted               :      Boolean default false;
        qaQcStatus              :      String(50);
        lastUpdatedBy           :      String(100);
        latestApprovalDate      :      DateTime;
        batchNumber             :      String(50);
        projectName             :      String(100);
        departmentID            :      associations.DepartmentAssociation;
        departmentName          :      String(100);
        displayName             :      Map;
        pipeOD                  :      String;
        modelNo                 :      String;
        calibrationDueDate      :      DateTime;
        jointNo                 :      String;
        welderName              :      String;
        visualObservation       :      String;
        location                :      String;
        make                    :      String;
        alignmentClampUsed      :      String;
        machineSerialNumber     :      String;
        geoData                 :      Map;
        pipeFittingDetail       :      String;
        Id_550266291000000000   :      String;
}

entity MDPETee {
    key ID                      :      UUID;
        assetId                 :      String(100);
        installationDate        :      String(20);
        attachment              :      String(255);
        size                    :      String(50);
        electroFusionJoinNumber :      String(50);
        heatingTime             :      Integer;
        coolingTime             :      Integer;
        temperature             :      String(20);
        electroFusionMachine    :      String(50);
        manufacturer            :      String(100);
        ID_6232790426           :      String(255);
        efMachineSerialNumber   :      String(50);
        redFlags                : many String;
        projectId               :      associations.ProjectAssociation;
        submittedBy             :      String(100);
        formId                  :      associations.FormAssociation;
        formName                :      String(50);
        submissionType          :      String(50);
        equipmentType           :      String(50);
        serverUniqueId          :      Integer;
        uniqueId                :      String(100);
        lastUpdatedDate         :      DateTime;
        status                  :      String;
        recordId                :      String;
        submittedTime           :      DateTime;
        isDeleted               :      Boolean default false;
        qaQcStatus              :      String(50);
        lastUpdatedBy           :      String(100);
        latestApprovalDate      :      DateTime;
        batchNumber             :      String(50);
        projectName             :      String(100);
        departmentID            :      associations.DepartmentAssociation;
        departmentName          :      String(100);
        displayName             :      Map;
        pipeOD                  :      String;
        modelNo                 :      String;
        calibrationDueDate      :      DateTime;
        jointNo                 :      String;
        welderName              :      String;
        visualObservation       :      String;
        location                :      String;
        make                    :      String;
        alignmentClampUsed      :      String;
        machineSerialNumber     :      String;
        pipeFittingDetail       :      String;
        Id_73979872531000000000 :      String;
        pipeO                   :      Map;
}

entity MDPETransitionFitting {
    key ID                      :      UUID;
        assetId                 :      String(100);
        ID_4887183193           :      String(100);
        installationDate        :      String(20);
        attachment              :      String(255);
        diameter                :      String(50);
        manufacturer            :      String(100);
        guardInstalled          :      String(10);
        electroFusionJoinNumber :      String(50);
        heatingTime             :      Integer;
        coolingTime             :      Integer;
        temperature             :      String(20);
        electroFusionMachine    :      String(50);
        ID_1347308513           :      String(255);
        ID_7340795239           :      String(255);
        efMachineSerialNumber   :      String(50);
        redFlags                : many String;
        projectId               :      associations.ProjectAssociation;
        submittedBy             :      String(100);
        formId                  :      associations.FormAssociation;
        formName                :      String(50);
        submissionType          :      String(50);
        equipmentType           :      String(50);
        serverUniqueId          :      Integer;
        uniqueId                :      String(100);
        lastUpdatedDate         :      DateTime;
        status                  :      String;
        recordId                :      String;
        submittedTime           :      DateTime;
        isDeleted               :      Boolean default false;
        qaQcStatus              :      String(50);
        lastUpdatedBy           :      String(100);
        batchNumber             :      String(50);
        projectName             :      String(100);
        departmentID            :      associations.DepartmentAssociation;
        departmentName          :      String(100);
        displayName             :      Map;
        pipeOD                  :      String;
        modelNo                 :      String;
        calibrationDueDate      :      DateTime;
        jointNo                 :      String;
        welderName              :      String;
        visualObservation       :      String;
        location                :      String;
        make                    :      String;
        alignmentClampUsed      :      String;
        machineSerialNumber     :      String;
        geoData                 :      Map;
        pipeFittingDetail       :      String;
        Id_7233232185           :      String;
        Id_18452779301000000000 :      String;
        Id_2585592562           :      String;
        Id_5246818101           :      String;
        Id_8458894283           :      String;
        Id_4522894508           :      String;
        Id_4005671065           :      String;
        Id_8796478643           :      String;
}