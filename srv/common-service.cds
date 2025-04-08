namespace AIPA;

using {Common.Departments as DepartmentsEn} from '../db/common';
using {AIPALocal.staticTypes as staticType} from '../db/staticTypes';


service CommonServices {
    @cds.persistence.skip
    entity Departments as projection on DepartmentsEn;

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

    @cds.persistence.skip
    entity BTPUser {
        key username       : String;
            name           : String;
            lastname       : String;
            isActive       : Boolean;
            userId         : String;
            phone          : String;
            mailVerified   : Boolean;
            adminType      : String;
            departments    : String;
            imageurl       : String;
            imagefilename  : String;
            departmentName : String;
            departmentId   : String;
            fullname       : String;
            signurl        : String;
            vendor         : String;
    }

    @cds.persistence.skip
    // In your code this has only CREATE / UPDATE & DELETE Operation
    entity UserManagement {
        key username        :      String;
            data            :      String;
            name            :      String;
            lastname        :      String;
            phone           :      String;
            adminType       :      String;
            departments     : many String;
            imageurl        :      String;
            status          :      Integer;
            message         :      String;
            createdBy       :      String;
            createdByMailID :      String;
            signature       :      String;
            vendors         :      String;
            vendor          :      String
    }

    @cds.persistence.skip
    entity FieldUser {
        key username                          : String; // Points out as email
            vendor                            : String;
            type                              : Integer;
            privilege                         : String;
            numberOfAttemptsWithWrongPassword : Integer;
            isAccountLocked                   : Boolean;
            adminRole                         : String;
            userType                          : String;
            lastLoggedInTime                  : Timestamp;
            deviceDetails                     : String;
            isFirstLogin                      : Boolean;
            createdByMailID                   : String;
            createdBy                         : String;
            adminlist                         : String;
            createdDateTime                   : Timestamp;
            selectedGroupList                 : String;
            isUserLocatorActive               : Boolean;
            imageurl                          : String;
            imagefilename                     : String;
            adminType                         : String;
            isDeleted                         : Boolean;
            departments                       : String;
            phone                             : String;
            name                              : String;
            password                          : String;
            accountLockedOn                   : Timestamp;
            departmentName                    : String;
            lastname                          : String;
            creationDate                      : String;
            signurl                           : String
    }

    @cds.persistence.skip
    entity GetVendorsAndAdmins {
        key status          : Int16;
            message         : String;
            UserType        : Integer;
            AdminType       : String;
            department_name : String;
            vendors         : String;
            admin           : String;
    }

    @cds.persistence.skip
    entity UserManagementName {
        key name     : String;
            username : String;
    }

    @cds.persistence.skip
    entity DepartmentValueHelp {
        key name       : String;
            postalcode : String;
    }

    @cds.persistence.skip
    entity Departmentforvaluehelp1 {
        key name       : String;
            postalcode : String;
    }

    @cds.persistence.skip
    entity Departmentforvaluehelp {
        key name         : String;
            description  : String;
            departmentId : String;
    }

    @cds.persistence.skip
    entity AdministratorName {
        key name     : String;
            username : String;
    }

    @cds.persistence.skip
    entity Activity {
        key name                 :      String;
            id                   :      String;
            type                 :      String;
            applicationType      :      String;
            objectType           :      String;
            dependentFields      : many String;
            allocatedDepartments : many String;
            displayField         : many {
                label : String;
                id    : String;
            };
            formzCategory        : many String;
            category             :      String;
            isVisible            :      Boolean;
            createdTime          :      Timestamp;
            formType             :      String;
            departmentName       :      String;
            ownerMailId          :      String;
            ownerName            :      String;
            description          :      String;
            workInstructions     :      String;
    }

    @cds.persistence.skip
    entity ActivityFieldDetails {
        key formId                   :      String;
            formData                 :      String;
            skeletonData             :      String;
            name                     :      String;
            isRuleDefined            :      Boolean;
            type                     :      String;
            applicationType          :      String;
            objectType               :      String;
            isMediaAvailable         :      Boolean;
            references               :      String;
            workInstruction          :      String;
            lastModifiedDate         :      DateTime;
            lastModifiedBy           :      String;
            description              :      String;
            isAllowMap               :      Boolean;
            alternativeMailid        :      String;
            category                 :      String;
            isVisible                :      Boolean;
            createdBy                :      String;
            createdTime              :      DateTime;
            formType                 :      String;
            version                  :      Integer;
            FormSkeleton             :      String;
            isWholeSkeleton          :      Boolean;
            isCreateNewForm          :      Boolean;
            formSkeletonLevelChanges :      String;
            updatedData              :      String;
            dependentFields          : many String;
            displayField             : many {
                formId : String;
                id     : String;
                label  : String;
            };
            newFormName              :      String;
            locationField            : many {
                formId : String;
                id     : String;
                label  : String;
            };
            status                   :      Integer;
            message                  :      String;
            ownerMailId              :      String;
            ownerName                :      String;
            workInstructions         :      String;
            assetType                :      String;
            formUpdate               :      String;
    }

    @cds.persistence.skip
    entity RedFlagRule {
        key id               :      String;
            form             :      String;
            createdDateTime  :      Timestamp;
            formId           :      String;
            isActive         :      Boolean;
            isDeleted        :      Boolean;
            lastModifiedDate :      Timestamp;
            operation        :      String;
            projectType      :      String;
            value            :      String;
            widgetId         :      String;
            widgetName       :      String;
            compareType      :      String;
            multiValue       : many String;
            compareWidgetId  :      String;
    }

    @cds.persistence.skip
    entity Assets {
        key name                         :      String;
        key objectType                   :      String;
            id                           :      String; // need for preview and flagrule
            type                         :      String;
            applicationType              :      String;
            isMediaAvailable             :      Boolean;
            references                   :      String;
            workInstruction              :      String;
            lastModifiedDate             :      Timestamp;
            lastModifiedBy               :      String;
            description                  :      String;
            geoFields                    : many String;
            isAllowMap                   :      Boolean;
            mandatoryFields              : many String;
            dependentFields              : many String;
            allocatedcategories          : many String;
            allocatedDepartments         : many String;
            displayField                 : many {
                label : String;
                id    : String;
            };
            templateoriginalName         :      String;
            locationField                : many {
                label : String;
                id    : String;
            };
            shareGroup                   : many String;
            generatedIdForFileAttachment : many String;
            formzCategory                : many String;
            allocatedUsers               : many String;
            alternativeMailid            :      String;
            category                     :      String;
            isVisible                    :      Boolean;
            createdBy                    :      String;
            createdTime                  :      Timestamp;
            formType                     :      String;
            version                      :      Integer;
            isRuleDefined                :      Boolean;
            maxZoomLevel                 :      Integer;
            minZoomLevel                 :      Integer;
            departmentName               :      String;
            ownerMailId                  :      String;
            ownerName                    :      String;
            workInstructions             :      String;
            message                      :      String; // to send response to frontend
    }

    @cds.persistence.skip
    entity AssetFieldDetails {
        key formId                   :      String;
            formData                 :      String;
            skeletonData             :      String;
            name                     :      String;
            isRuleDefined            :      Boolean;
            type                     :      String;
            applicationType          :      String;
            objectType               :      String;
            isMediaAvailable         :      Boolean;
            references               :      String;
            workInstruction          :      String;
            lastModifiedDate         :      DateTime;
            lastModifiedBy           :      String;
            description              :      String;
            isAllowMap               :      Boolean;
            alternativeMailid        :      String;
            category                 :      String;
            isVisible                :      Boolean;
            createdBy                :      String;
            createdTime              :      DateTime;
            formType                 :      String;
            version                  :      Integer;
            FormSkeleton             :      String;
            isWholeSkeleton          :      Boolean;
            isCreateNewForm          :      Boolean;
            formSkeletonLevelChanges :      String;
            updatedData              :      String;
            dependentFields          : many String;
            displayField             : many {
                formId : String;
                id     : String;
                label  : String;
            };
            newFormName              :      String;
            locationField            : many {
                formId : String;
                id     : String;
                label  : String;
            };
            status                   :      Integer;
            message                  :      String;
            ownerMailId              :      String;
            ownerName                :      String;
            workInstructions         :      String;
            assetType                :      String;
            formUpdate               :      String;
    }

    @cds.persistence.skip
    entity ActivityAssetPreview {
        key id                    : String;
            label                 : String;
            isRequired            : Boolean;
            type                  : String;
            form                  : String;
            placeholder           : String;
            size                  : String;
            defaultValue          : String;
            minLength             : String;
            maxLength             : String;
            isUnderHeading        : String;
            isDependentField      : Boolean;
            disabled              : String;
            displayName           : String;
            typeChange            : String;
            formId                : String;
            position              : String;
            isAllowMultiselection : String;
            tablename             : String;
            options               : String;
    }

    @cds.persistence.skip
    entity DocumentUploads {
        key mainId         : String;
            data           : String;
            departmentName : String;
            types          : String;
            allDoc         : Boolean;
            asset          : String;
            projectName    : String;
            recordId       : String;
    }

    @cds.persistence.skip
    entity DeviceData {
        key UUID           : String;
        key requestedUser  : String;
            departmentName : String;
            appVersion     : String;
            isDeleted      : Boolean;
            lastUpdated    : DateTime;
            deviceType     : String;
            createdTime    : DateTime;
            version        : String;
            platform       : String;
            status         : String;
            MacAddress     : String;
            Model          : String;
            Manufacturer   : String;
            fcmKey         : String;
            deviceModel    : String;
            deviceUUID     : String;
            source         : String;
            activity       : String;
            username       : String;
            timestamp      : DateTime;
    }

    @cds.persistence.skip
    entity DeviceActivity {
        key UUID           : String;
            departmentName : String;
            requestedUser  : String;
            lastUpdated    : Timestamp;
            status         : String;
            Model          : String;
            timestamp      : DateTime;
            fromDate       : String;
            toDate         : String;
            deviceModel    : String;
            deviceUUID     : String;
            source         : String;
            activity       : String;
            username       : String;
    }

    @cds.persistence.skip
    entity Downloadtemplates {
        key id        : String;
            data      : String;
            assetType : String;
    }

    @cds.persistence.skip
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
            pmcNo                 : String;
            clientNo              : String;
            contractorNo          : String;
            projectLength         : Integer;
            pipeDiameter          : String(50);
            networkComprise       : array of String;
            chargeArea            : String(50);
            grade                 : String(50);
            referenceProject      : String(100);
            ndtAgency             : String(100);
            pressure              : String(50);
            description           : String(255);
            users                 : Map;
            equipmentType         : String;
            efMachineSerialNumber : String;
            department            : Map;
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
            projectID             : Map;
            update                : Map;
            updateProject         : Map;
    }

    @cds.persistence.skip
    entity ProjectInsights {
        key departmentName   : String;
            deptInsights     : String;
            projectWiseDelay : String;
            equipmentType    : String;
    }

    @cds.persistence.skip
    entity DepartProjectDetails {
        key name           : String;
            projectName    : String;
            data           : String;
            departmentName : String;
            equipmentType  : String
    }

    @cds.persistence.skip
    entity GetOverallProjectInsights {
        key data        : String;
            status      : Int32;
            projectType : String;
            message     : String;
            deptId      : String;
            projectIds  : String;
    }

    @cds.persistence.skip
    entity GetProjectCompletion {
        key data       : String;
            status     : Int32;
            message    : String;
            deptId     : String;
            projectIds : String;
    }

    @cds.persistence.skip
    entity GetGADelayedProjects {
        key data       : String;
            status     : Int32;
            message    : String;
            deptId     : String;
            projectIds : String;
    }

    @cds.persistence.skip
    entity GetAllContractor {
        key name         : String;
            departmentId : String;
            shortname    : String;
    }

    @cds.persistence.skip
    entity ProjectAssetsComponents {
        key projectName    : String;
            assetDetails   : String;
            objecttype     : String;
            details        : String;
            type           : String;
            formDetails    : String;
            projectDetails : String;
            departmentName : String;
            userType       : String;
            name           : String;
            UserName       : String;
    }
}
