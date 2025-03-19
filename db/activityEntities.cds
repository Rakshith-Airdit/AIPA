namespace Activity;

using {AIPALocal.db.Associations as associations} from './associations';

entity ActivityBackfilling {
    key ID                      :      UUID;
        Id_1567869128           :      String(50);
        Id_1791461492           :      String(255);
        Id_23171826871000000000 :      String(50);
        Id_2498739236           :      String(50);
        Id_2513202218           :      String(50);
        Id_2542874873           :      array of String;
        Id_2888624632           :      String(50);
        Id_3420248098           :      String(255);
        Id_3647283282           :      String(255);
        Id_4644488018           :      String(255);
        Id_4955834874           :      String(50);
        Id_5356106134           :      array of String;
        Id_5550856264           :      String(255);
        Id_5564557531           :      String(255);
        Id_6545160103           :      String(255);
        Id_6811806770           :      String(500);
        Id_7197420905           :      String(255);
        Id_8381975612           :      String(255);
        Id_9923603692           :      String(500);
        __v                     :      Integer;
        departmentName          :      String(100);
        displayName             :      Map;
        formId                  :      associations.FormAssociation;
        formName                :      String(100);
        isDeleted               :      Boolean default false;
        latestApprovalDate      :      DateTime;
        lastUpdatedDate         :      DateTime;
        projectID               :      associations.ProjectAssociation;
        projectName             :      String(100);
        qaQcStatus              :      String(50);
        redFlags                : many String;
        serverUniqueId          :      String(100);
        status                  :      Integer;
        submittedBy             :      String(100);
        submittedTime           :      DateTime;
        recordID                :      String;
}

entity ActivityCoating {
    key ID                 :      UUID;
        project            :      associations.ProjectAssociation;
        status             :      Integer;
        submittedBy        :      String(100);
        formId             :      associations.FormAssociation;
        formName           :      String(100);
        serverUniqueId     :      String(100);
        displayName        :      Map;
        lastUpdatedDate    :      DateTime;
        recordID           :      String;
        submittedTime      :      DateTime;
        isDeleted          :      Boolean default false;
        qaQcStatus         :      String(50);
        latestApprovalDate :      DateTime;
        projectName        :      String(100);
        departmentName     :      String(100);
        Id_5892295256      :      String(255);
        Id_6830296061      :      String(255);
        Id_7879325122      :      String(255);
        Id_4763159582      :      String(50);
        Id_8482814262      :      String(255);
        Id_8383409832      :      String(50);
        Id_6694897110      :      String(255);
        Id_6218690174      :      String(255);
        Id_5974391046      :      String(255);
        Id_5201647154      :      String(500);
        Id_4659404196      :      String(255);
        Temperature        :      String(50);
        Id_9883978062      :      String(255);
        Id_4828512709      :      String(500);
        Id_9825793151      :      String(255);
        Id_2646983718      :      String(255);
        Id_9527443549      :      String(255);
        Id_1760056839      :      String(255);
        Id_6880531967      :      String(255);
        Id_1187218917      :      String(500);
        Id_8907180095      :      String(255);
        Id_9194645252      :      String(255);
        Id_7308746299      :      String(255);
        Id_2814333402      :      String(255);
        Id_6563707532      :      String(255);
        Id_2887199683      :      String(255);
        Id_1559954734      :      String(255);
        Id_5476106569      :      String(50);
        Id_1682855236      :      String(255);
        Id_7849446109      :      String(255);
        Id_3573985739      :      String(255);
        Id_5713241098      :      String(255);
        Id_9108306705      :      String(255);
        Id_2235441804      :      String(255);
        Id_1351750691      :      String(255);
        Id_6109671173      :      String(255);
        Id_4604087300      :      String(50);
        Id_2750287973      :      String(500);
        Id_4064689365      :      String(255);
        redFlags           : many String;
        geoTagType         :      String(50);
}

entity ActivityCrossings {
    key ID                  :      UUID;
        project             :      associations.ProjectAssociation;
        status              :      Integer;
        submittedBy         :      String(100);
        formId              :      associations.FormAssociation;
        formName            :      String(100);
        serverUniqueId      :      String(100);
        displayName         :      Map;
        lastUpdatedDate     :      DateTime;
        recordID            :      String;
        submittedTime       :      DateTime;
        isDeleted           :      Boolean default false;
        qaQcStatus          :      String(50);
        projectName         :      String(100);
        departmentName      :      String(100);
        Id_8569909082       :      String(255);
        Id_8615397004       :      String(50);
        Id_3788374188       :      array of String;
        Location_1245154013 :      String(255);
        Location_1310584689 :      String(255);
        Id_2422550481       :      String(50);
        Id_5021736814       :      String(255);
        Id_2394745855       :      String(500);
        Id_8420023217       :      String(255);
        Id_4963359839       :      String(255);
        Id_3823539119       :      String(50);
        Id_4329913394       :      String(255);
        Id_1085910921       :      String(255);
        redFlags            : many String;
        geoData             :      Map;
        geoTagType          :      String(50);
}

entity ActivityDailyCommentsOptional {
    key ID              :      UUID;
        project         :      associations.ProjectAssociation;
        status          :      Integer;
        submittedBy     :      String(100);
        formId          :      associations.FormAssociation;
        formName        :      String(100);
        serverUniqueId  :      String(100);
        displayName     :      Map;
        lastUpdatedDate :      DateTime;
        recordID        :      String;
        submittedTime   :      DateTime;
        isDeleted       :      Boolean default false;
        qaQcStatus      :      String(50);
        projectName     :      String(100);
        departmentName  :      String(100);
        Id_5563630673   :      String(255);
        Id_9796638416   :      DateTime;
        redFlags        : many String;
}

entity ActivityDrilling {
    key ID                 : UUID;
        project            : associations.ProjectAssociation;
        projectName        : String(100);
        departmentName     : String(100);
        departmentId       : associations.DepartmentAssociation;
        formId             : associations.FormAssociation;
        formName           : String(100);
        displayName        : Map;
        equipmentType      : String(50);
        lastUpdatedDate    : DateTime;
        submittedTime      : DateTime;
        isDeleted          : Boolean default false;
        qaQcStatus         : String(50);
        latestApprovalDate : DateTime;
        recordID           : String;
        Id_1738127972383   : String(255);
        Id_1738127976257   : String(255);
        Id_1738127977444   : String(50);
        Id_1738127979557   : String(50);
        Id_1738127983023   : String(50);
        Id_1738127982211   : String(255);
        Id_1738127980508   : String(50);
        Id_1738127978569   : array of String;
        Id_1738216701455   : String(255);
}

entity ActivityElectrodeQualificationTest {
    key ID              :      UUID;
        projectId       :      associations.ProjectAssociation;
        projectName     :      String(100);
        departmentID    :      associations.DepartmentAssociation;
        departmentName  :      String(100);
        status          :      Integer;
        submittedBy     :      String(100);
        formId          :      associations.FormAssociation;
        formName        :      String(100);
        serverUniqueId  :      String(100);
        displayName     :      Map;
        recordID        :      String;
        submittedTime   :      DateTime;
        lastUpdatedDate :      DateTime;
        isDeleted       :      Boolean default false;
        qaQcStatus      :      String(50); // Renamed "QA/QC Status" to a valid field name

        Id_6033449607   :      String(50); // Date stored as string
        Id_4349975771   :      String(255);
        Id_6449815755   :      String(255);
        Id_7935696578   :      String(255);
        Id_2594719940   :      String(255);
        Id_4704371460   :      String(255);
        Id_3888164944   :      String(255);
        Id_9352750796   :      String(50);
        Id_6193307791   :      String(255);
        Id_6628846193   :      String(50);
        Id_2478798577   :      String(255);
        Id_4577927164   :      String(255);
        Id_8687820587   :      String(255);
        Id_5555179740   :      String(50);
        Id_8010722039   :      String(255);
        Id_5714664474   :      String(50);
        Id_8162483157   :      String(255);
        Id_9225049619   :      String(50);
        Id_5426705205   :      String(255);
        Id_8459494778   :      String(50);
        Id_7357343413   :      String(50);
        Id_8587125005   :      String(50);
        redFlags        : many String; // JSON array stored as string
}

entity ActivityHydrotest {
    key ID                 :      UUID;
        projectId          :      associations.ProjectAssociation;
        projectName        :      String(100);
        departmentID       :      associations.DepartmentAssociation;
        departmentName     :      String(100);
        status             :      Integer;
        submittedBy        :      String(100);
        formId             :      associations.FormAssociation;
        formName           :      String(100);
        serverUniqueId     :      String(100);
        displayName        :      Map; // Storing JSON array as a string
        recordID           :      String;
        submittedTime      :      DateTime;
        lastUpdatedDate    :      DateTime;
        isDeleted          :      Boolean default false;
        qaQcStatus         :      String(50); // Renamed "QA/QC Status" to a valid field name
        latestApprovalDate :      DateTime;
        Id_1589809346      :      String(255);
        Id_5774800404      :      LargeString; // JSON array stored as string
        Id_3870652856      :      String(50); // Date stored as string
        Id_4718470100      :      String(255);
        Id_8896079989      :      String(50);
        Id_8578095397      :      String(50);
        Id_3594429699      :      String(255);
        Id_1644036307      :      String(500); // File URL
        Id_3452111089      :      String(255);
        Id_7707471674      :      String(255);
        redFlags           : many String; // JSON array stored as string
        __v                :      Integer;
        lastUpdatedBy      :      String(100);
        submissionType     :      String(50);
}

entity ActivityLowering {
    key ID                      :      UUID;
        projectId               :      associations.ProjectAssociation;
        projectName             :      String(100);
        departmentID            :      associations.DepartmentAssociation;
        departmentName          :      String(100);
        status                  :      Integer;
        submittedBy             :      String(100);
        formId                  :      associations.FormAssociation;
        formName                :      String(100);
        serverUniqueId          :      String(100);
        displayName             :      Map; // Storing JSON array as a string
        recordID                :      String;
        submittedTime           :      DateTime;
        lastUpdatedDate         :      DateTime;
        isDeleted               :      Boolean default false;
        qaQcStatus              :      String(50); // Renamed "QA/QC Status" to a valid field name
        latestApprovalDate      :      DateTime;
        Id_5706082250           :      String(255);
        Id_9497321496           :      String(50);
        Id_2736750530           :      String(255); // JSON array stored as string
        Id_2968391615           :      String(50);
        Id_7229206580           :      String(50);
        Id_5932708931           :      String(255);
        Id_6969473118           :      String(50);
        Id_3429873796           :      String(500); // File URL
        Id_4254761413           :      String(50);
        Id_9370696042           :      String(50);
        Id_3083374038           :      String(50);
        Id_4343725966           :      String(255);
        Id_7288750439           :      String(50);
        Id_2775709972           :      String(50);
        Id_3691335410           :      String(50);
        Id_5717118133           :      String(500); // File URL
        Id_6067340433           :      String(255);
        Id_7280606679           :      String(50);
        Id_9906575783           :      String(255);
        Id_6736513594           :      String(255);
        Id_3147148436           :      String(255);
        Id_1316753383           :      String(255);
        Id_8660476654           :      String(255);
        Id_1736114932           :      String(255);
        Id_58871683931000000000 :      String(255);
        redFlags                : many String; // JSON array stored as string
}

entity ActivityMechanicalClearanceCertificate {
    key ID                 :      UUID;
        projectId          :      associations.ProjectAssociation;
        projectName        :      String(100);
        departmentID       :      associations.DepartmentAssociation;
        departmentName     :      String(100);
        status             :      Integer;
        submittedBy        :      String(100);
        formId             :      associations.FormAssociation;
        formName           :      String(100);
        serverUniqueId     :      String(100);
        displayName        :      Map; // Storing JSON array as a string
        recordID           :      String;
        submittedTime      :      DateTime;
        lastUpdatedDate    :      DateTime;
        isDeleted          :      Boolean default false;
        qaQcStatus         :      String(50); // Renamed "QA/QC Status" to a valid field name

        Id_4664663613      :      String(50); // Date stored as string
        Id_2535682197      :      String(255);
        Id_9455120492      :      String(50);
        Id_9719677249      :      String(50);
        Id_4296236246      :      String(50);
        Id_7240820559      :      String(50);
        Id_2106807263      :      String(255);
        Id_7054652203      :      String(255);
        Id_5774257848      :      String(50);
        Id_2348461550      :      String(50);
        Id_3674147837      :      String(50);
        Id_7186369555      :      String(50);
        Id_9884709132      :      String(50);
        Id_5116252225      :      String(50);
        Id_7453360817      :      String(50);
        Id_3779847338      :      String(50);
        Id_5473540058      :      String(50);
        Id_2864679238      :      String(50);
        Id_8416867538      :      String(50);
        Id_6492750406      :      String(255);
        redFlags           : many String; // JSON array stored as string
        latestApprovalDate :      DateTime;
        typeOfRepair       :      String(255);
}

entity ActivityMiscellaneousOptional {
    key ID                  :      UUID;
        projectId           :      associations.ProjectAssociation;
        projectName         :      String(100);
        departmentID        :      associations.DepartmentAssociation;
        departmentName      :      String(100);
        status              :      Integer;
        submittedBy         :      String(100);
        formId              :      associations.FormAssociation;
        formName            :      String(100);
        serverUniqueId      :      String(100);
        displayName         :      Map; // Storing JSON array as a string
        recordID            :      String;
        submittedTime       :      DateTime;
        lastUpdatedDate     :      DateTime;
        isDeleted           :      Boolean default false;
        qaQcStatus          :      String(50); // Renamed "QA/QC Status" to a valid field name

        Id_6295848250       :      String(255);
        Id_9751822119       :      String(50); // Date stored as string
        Id_1430450943       :      String(255);
        Location_2161517599 :      String(100); // Storing coordinates as string
        Id_2910389992       :      String(500); // File URL
        Id_8097690500       :      String(255);
        redFlags            : many String; // JSON array stored as string

}

entity ActivityNDTMPT {
    key ID              :      UUID;
        projectId       :      associations.ProjectAssociation;
        projectName     :      String(100);
        departmentID    :      associations.DepartmentAssociation;
        departmentName  :      String(100);
        status          :      Integer;
        submittedBy     :      String(100);
        formId          :      associations.FormAssociation;
        formName        :      String(100);
        serverUniqueId  :      String(100);
        displayName     :      Map; // Storing JSON array as a string
        recordID        :      String;
        submittedTime   :      DateTime;
        lastUpdatedDate :      DateTime;
        isDeleted       :      Boolean default false;
        qaQcStatus      :      String(50); // Renamed "QA/QC Status" to a valid field name

        Id_3669790113   :      String(50); // Date stored as string
        Id_8168876512   :      String(50);
        Id_3270002853   :      String(50);
        Id_9270386974   :      String(50);
        Id_6662280604   :      String(50);
        Id_7711106849   :      String(50);
        Id_8704917659   :      String(50);
        Id_1455754702   :      String(255);
        Id_4770782575   :      String(50);
        Id_8551190874   :      String(50);
        Id_1605722200   :      String(255);
        Id_2664532609   :      String(50);
        redFlags        : many String; // JSON array stored as string
}

entity ActivityNDTPTOptional {
    key ID              :      UUID;
        projectId       :      associations.ProjectAssociation;
        projectName     :      String(100);
        departmentID    :      associations.DepartmentAssociation;
        departmentName  :      String(100);
        status          :      Integer;
        submittedBy     :      String(100);
        formId          :      associations.FormAssociation;
        formName        :      String(100);
        serverUniqueId  :      String(100);
        displayName     :      Map; // Storing JSON array as a string
        recordID        :      String;
        submittedTime   :      DateTime;
        lastUpdatedDate :      DateTime;
        isDeleted       :      Boolean default false;
        qaQcStatus      :      String(50); // Renamed "QA/QC Status" to a valid field name

        Id_4255312805   :      String(255);
        Id_6283765367   :      String(50);
        Id_4987627052   :      String(50);
        Id_7899091568   :      String(50);
        Id_2367543794   :      String(50);
        Id_7744963100   :      String(50);
        Id_4937941932   :      String(50); // Date stored as string
        Id_4561933481   :      String(50);
        Id_7710776665   :      String(50); // Date stored as string
        Id_3572342520   :      String(50);
        Id_6048570843   :      String(50); // Date stored as string
        Id_5989391781   :      String(50);
        Id_6717688035   :      String(50);
        Id_6135656270   :      String(50); // Date stored as string
        Id_7944967986   :      String(255);
        Id_4436129049   :      String(500); // File URL
        Id_1366063288   :      String(255);
        Id_9803380417   :      String(255);
        Id_8231138878   :      String(255);
        Id_2629607746   :      String(255);
        redFlags        : many String; // JSON array stored as string;
}

entity ActivityNDTRadiography {
    key ID              :      UUID;
        projectId       :      associations.ProjectAssociation;
        projectName     :      String(100);
        departmentId    :      associations.DepartmentAssociation;
        departmentName  :      String(100);
        status          :      Integer;
        submittedBy     :      String(100);
        formId          :      associations.FormAssociation;
        formName        :      String(100);
        serverUniqueId  :      String(100);
        displayName     :      Map; // Storing JSON array as a string
        recordID        :      String;
        submittedTime   :      DateTime;
        lastUpdatedDate :      DateTime;
        isDeleted       :      Boolean default false;
        qaQcStatus      :      String(50); // Renamed "QA/QC Status" to a valid field name

        Id_4996723633   :      String(255);
        Id_1171123585   :      String(255);
        Id_9516348963   :      String(255);
        Id_9764804932   :      String(50);
        Id_3185010001   :      String(255);
        Id_1429920994   :      String(255);
        Id_8307829728   :      String(255);
        Id_5331473290   :      String(255);
        Id_5550286100   :      String(255);
        Id_7408642223   :      String(50);
        Id_6809119935   :      String(255);
        Id_5460370085   :      String(255);
        Id_8028530378   :      String(255);
        Id_3613959758   :      String(255);
        Id_9442246925   :      String(255);
        Id_2181644018   :      String(255);
        Id_6197374787   :      String(255);
        Id_5647429302   :      String(255);
        Id_7614285897   :      String(50); // Date stored as string
        Id_2686277068   :      String(255);
        Id_7372304048   :      String(50);
        Id_2498501649   :      String(255);
        Id_3143838734   :      String(255);
        Id_6792726537   :      String(500); // File URL
        Id_2158902239   :      String(255);
        Id_7282912096   :      String(255);
        Id_9844632096   :      String(50);
        redFlags        : many String; // JSON array stored as string;
        typeOfRepair    :      String(255);
}

entity ActivityNDTUltrasonic {
    key ID              :      UUID;
        projectId       :      associations.ProjectAssociation;
        projectName     :      String(100);
        departmentId    :      associations.DepartmentAssociation;
        departmentName  :      String(100);
        status          :      Integer;
        submittedBy     :      String(100);
        formId          :      associations.FormAssociation;
        formName        :      String(100);
        serverUniqueId  :      String(100);
        displayName     :      Map; // Storing JSON array as a string
        recordID        :      String;
        submittedTime   :      DateTime;
        lastUpdatedDate :      DateTime;
        isDeleted       :      Boolean default false;
        qaQcStatus      :      String(50); // Renamed "QA/QC Status" to a valid field name

        Id_7107366196   :      String(255);
        Id_4358293945   :      String(255);
        Id_7651607351   :      String(255);
        Id_4785411612   :      String(255);
        Id_3535779847   :      String(255);
        Id_2204818951   :      String(255);
        Id_3461912668   :      String(255);
        Id_4096269812   :      String(255);
        Id_6357211203   :      String(255);
        Id_5137136688   :      String(50);
        Id_9327566507   :      String(50);
        Id_7931517999   :      String(255);
        Id_6703803284   :      LargeString; // JSON array stored as string
        Id_6695758731   :      String(50); // Date stored as string
        Id_7106073623   :      String(50); // Date stored as string
        Id_8047386464   :      String(255);
        Id_3267018436   :      String(50);
        Id_2873858854   :      String(255);
        Id_1748959970   :      String(50);
        Id_6266900321   :      String(255);
        Id_2205898124   :      String(50);
        Id_1634352748   :      String(50);
        Id_7219806204   :      String(50); // Date stored as string
        Id_6729392332   :      String(255);
        Id_6746858846   :      String(500); // File URL
        Id_6857172311   :      String(500); // File URL
        Id_1273461616   :      String(255);
        Id_9263526810   :      String(255);
        Id_4992832323   :      String(255);
        redFlags        : many String; // JSON array stored as string
}

entity ActivityProcedureQualificationRecord {
    key ID              :      UUID;
        projectId       :      associations.ProjectAssociation;
        projectName     :      String(100);
        departmentId    :      associations.DepartmentAssociation;
        departmentName  :      String(100);
        status          :      Integer;
        submittedBy     :      String(100);
        formId          :      associations.FormAssociation;
        formName        :      String(100);
        serverUniqueId  :      String(100);
        displayName     :      Map; // Storing JSON array as a string
        recordID        :      String;
        submittedTime   :      DateTime;
        lastUpdatedDate :      DateTime;
        isDeleted       :      Boolean default false;
        qaQcStatus      :      String(50); // Renamed "QA/QC Status" to a valid field name

        Id_5906337890   :      String(50);
        Id_3712675762   :      String(50); // Date stored as string
        Id_5029665564   :      String(255);
        Id_7387099317   :      String(255);
        Id_7736723796   :      String(255);
        Id_5290947256   :      String(255);
        Id_1664232930   :      String(255);
        Id_7501291270   :      String(255);
        Id_5422815042   :      String(255);
        Id_3184412424   :      String(255);
        Id_2055394134   :      String(255);
        Id_4795716385   :      String(255);
        Id_9106375501   :      String(255);
        Id_3219383435   :      String(255);
        Id_8675608772   :      String(255);
        Id_6421356670   :      String(255);
        Id_7427232774   :      String(255);
        Id_9075109853   :      String(255);
        Id_4921578083   :      String(255);
        Id_5825343437   :      String(255);
        Id_2562441372   :      String(255);
        Id_4514049405   :      String(255);
        Id_2743137121   :      String(255);
        Id_1563975665   :      String(255);
        Id_9172095525   :      String(255);
        Id_6188715607   :      String(255);
        Id_2534417156   :      String(255);
        Id_8933904904   :      String(255);
        Id_6692441915   :      String(255);
        Id_6165959049   :      String(255);
        Id_8594995530   :      String(255);
        Id_4935086619   :      String(255);
        Id_3156888793   :      String(255); // Status
        redFlags        : many String; // JSON array stored as string;
}

entity ActivityRestorationMarker {
    key ID                  :      UUID;
        projectId           :      associations.ProjectAssociation;
        projectName         :      String(100);
        departmentId        :      associations.DepartmentAssociation;
        departmentName      :      String(100);
        status              :      Integer;
        submittedBy         :      String(100);
        formId              :      associations.FormAssociation;
        formName            :      String(100);
        serverUniqueId      :      String(100);
        displayName         :      Map; // Storing JSON array as a string
        recordID            :      String;
        submittedTime       :      DateTime;
        lastUpdatedDate     :      DateTime;
        isDeleted           :      Boolean default false;
        qaQcStatus          :      String(50); // Renamed "QA/QC Status" to a valid field name

        Id_2077083219       :      String(50);
        Id_9275688374       :      String(50);
        Id_7792171064       :      String(255);
        Id_1573225191       :      String(255);
        Id_1876323982       :      String(500); // File URL
        Id_9169047225       :      String(50);
        Id_3509947417       :      String(500); // File URL
        Id_4418593001       :      String(50); // Date stored as string
        Id_1696751765       :      String(255);
        Id_7917267500       :      String(255);
        Id_1072561077       :      String(50); // Date stored as string
        Location_7240811628 :      String(255);
        Id_8358830354       :      String(255);
        Id_9856883341       :      String(255);
        Id_3620599117       :      String(255);
        Id_7639072111       :      String(255);
        redFlags            : many String; // JSON array stored as string
}

entity ActivityRoutedesignandapprovalOptional {
    key ID                  :      UUID;
        projectId           :      associations.ProjectAssociation;
        projectName         :      String(100);
        departmentId        :      associations.DepartmentAssociation;
        departmentName      :      String(100);
        status              :      Integer;
        submittedBy         :      String(100);
        formId              :      associations.FormAssociation;
        formName            :      String(100);
        serverUniqueId      :      String(100);
        displayName         :      Map; // Storing JSON array as a string
        recordID            :      String;
        submittedTime       :      DateTime;
        lastUpdatedDate     :      DateTime;
        isDeleted           :      Boolean default false;
        qaQcStatus          :      String(50); // Renamed "QA/QC Status" to a valid field name

        Id_7149886265       :      String(50); // Date stored as string
        Id_1364364465       :      String(255);
        Location_1908543857 :      String(100); // Storing GPS coordinates as string
        Id_5168277246       :      String(255);
        Id_1243861094       :      String(255);
        redFlags            : many String; // JSON array stored as string
}

entity ActivityRowCleaningandGradingOptional {
    key ID                      :      UUID;
        projectId               :      associations.ProjectAssociation;
        projectName             :      String(100);
        departmentId            :      associations.DepartmentAssociation;
        departmentName          :      String(100);
        status                  :      Integer;
        submittedBy             :      String(100);
        formId                  :      associations.FormAssociation;
        formName                :      String(100);
        serverUniqueId          :      String(100);
        displayName             :      Map; // Storing JSON array as a string
        recordID                :      String;
        submittedTime           :      DateTime;
        lastUpdatedDate         :      DateTime;
        isDeleted               :      Boolean default false;
        qaQcStatus              :      String(50); // Renamed "QA/QC Status" to a valid field name

        Id_1156327817           :      String(50);
        Id_2004413258           :      String(255);
        Id_8264407573           :      String(255);
        Id_8027990380           :      String(255);
        Id_8832547635           :      String(255);
        Id_1165307953           :      String(255); // Type of Ground
        Id_2940189045           :      String(50);
        Id_1520781249           :      String(50); // Date stored as string
        Id_8107934212           :      String(255);
        Id_2953259115           :      String(255);
        Id_5714191587           :      String(255);
        Id_3782271450           :      String(255);
        Id_4893234728           :      String(255);
        Id_2486305676           :      String(255);
        Id_1374663017           :      String(255);
        Id_52829942511000000000 :      String(255);
        Id_72250024741000000000 :      String(255);
        Id_6255608326           :      String(255);
        Id_4076738292           :      String(255);
        Id_2777651226           :      String(255);
        Id_1822160752           :      String(255);
        redFlags                : many String; // JSON array stored as string
        submissionType          :      String(255);
        lastUpdatedBy           :      String(255);
}

entity ActivitySkeleton {
    key ID                    : UUID;
        PropertyId            : String(50);
        label                 : String(255);
        defaultValue          : String(255);
        minDate               : Date;
        maxDate               : Date;
        typeOfDateSelected    : String(50);
        placeholder           : String(255);
        type                  : String(50);
        isUnderHeading        : String(255);
        isDependentField      : Boolean default false;
        typeChange            : String(255);
        formId                : associations.FormAssociation;
        position              : Integer;
        version               : Integer;
        isRequired            : Boolean default false;
        isPrimary             : Boolean default false;
        minInputVal           : Integer;
        maxInputVal           : Integer;
        disabled              : Boolean default false;
        isDeleted             : Boolean default false;
        disableonEdit         : Boolean default false;
        breakOf               : String;
        displayName           : Map;
        minLength             : Integer;
        maxLength             : Integer;
        imageSize             : Integer;
        videoDuration         : Integer;
        isInptAllowDecimals   : Boolean default false;
        size                  : Integer;
        isAllowMultiselection : Boolean default false;
        maxValue              : Integer;
        minValue              : Integer;
        options               : array of String;
        isTable               : Boolean default false;
}

entity ActivityStringing {
    key ID                      :      UUID;
        projectId               :      associations.ProjectAssociation;
        projectName             :      String(100);
        departmentId            :      associations.DepartmentAssociation;
        departmentName          :      String(100);
        status                  :      Integer;
        submittedBy             :      String(100);
        formId                  :      associations.FormAssociation;
        formName                :      String(100);
        serverUniqueId          :      String(100);
        displayName             :      Map; // Storing JSON array as a string
        recordID                :      String;
        submittedTime           :      DateTime;
        lastUpdatedDate         :      DateTime;
        isDeleted               :      Boolean default false;
        qaQcStatus              :      String(50); // Renamed "QA/QC Status" to a valid field name

        Id_7664913491           :      String(255); // Pipe No
        Id_1193954100           :      String(50); // Km
        Id_8453023560           :      String(255);
        Id_5238180658           :      String(255);
        Id_9825157255           :      String(50); // Section Length (m)
        Id_1489384726           :      String(50); // Date stored as string
        Id_6546458818           :      String(255);
        Id_2891741186           :      String(255);
        Id_4548782466           :      String(255);
        Id_6172778857           :      String(255);
        Id_6845727228           :      String(255);
        redFlags                : many String; // JSON array stored as string;
        coatingNo               :      String(50);
        heatNo                  :      String(50);
        wallThickness           :      String(50);
        Id_7415686787           :      String(255);
        Id_76353019711000000000 :      String(255);
        latestApprovalDate      :      DateTime;
}

entity ActivitySurveyingandstackingtheconstOptional {
    key ID                      :      UUID;
        projectId               :      associations.ProjectAssociation;
        projectName             :      String(100);
        departmentId            :      associations.DepartmentAssociation;
        departmentName          :      String(100);
        status                  :      Integer;
        submittedBy             :      String(100);
        formId                  :      associations.FormAssociation;
        formName                :      String(100);
        serverUniqueId          :      String(100);
        displayName             :      Map; // Storing JSON array as a string
        recordID                :      String;
        submittedTime           :      DateTime;
        lastUpdatedDate         :      DateTime;
        isDeleted               :      Boolean default false;
        qaQcStatus              :      String(50); // Renamed "QA/QC Status" to a valid field name
        lastUpdatedBy           :      String(100);
        Id_5751938202           :      String(50); // Date stored as string
        Id_3478571554           :      String(255);
        Location_4360452820     :      String(100); // Storing GPS coordinates as string
        Id_8000101507           :      String(255);
        Id_8194167580           :      String(255);
        redFlags                : many String; // JSON array stored as string
        Id_20792880111000000000 :      String(255);
        Id_2728016532           :      String(255);
        Id_7027666619           :      String(255);
        Id_79199419411000000000 :      String(255);
        geoTagType              :      String(255);
}

entity ActivityWelderPerformanceQualification {
    key ID                      :      UUID;
        projectId               :      associations.ProjectAssociation;
        projectName             :      String(100);
        departmentId            :      associations.DepartmentAssociation;
        departmentName          :      String(100);
        submittedBy             :      String(100);
        formId                  :      associations.FormAssociation;
        formName                :      String(100);
        serverUniqueId          :      String(100);
        displayName             :      Map; // Storing JSON array as a string
        recordID                :      String;
        submittedTime           :      DateTime;
        lastUpdatedDate         :      DateTime;
        createdDateTime         :      DateTime;
        createdBy               :      String(100);
        isDeleted               :      Boolean default false;
        qaQcStatus              :      String(50); // Renamed "QA/QC Status" to a valid field name
        status                  :      String(50);
        welderId                :      String(50);
        qualifiedIn             :      String(50);
        name                    :      String(100);
        img                     :      String(500); // File URL
        Id_9582715504           :      String(50); // Date stored as string
        Id_4782176612           :      String(255);
        Id_6722894757           :      String(255);
        Id_2937816910           :      String(255);
        Id_9988438692           :      String(255);
        Id_7730219543           :      String(255);
        Id_2648735629           :      String(255);
        Id_2052963356           :      String(255);
        Id_7382353133           :      String(255);
        Id_6229760920           :      String(255);
        Id_6824033334           :      String(255);
        Id_3953953166           :      String(255);
        Id_9919276110           :      String(255);
        Id_6283819414           :      String(255);
        Id_3872364934           :      String(255);
        Id_6137369823           :      String(255);
        Id_7587144857           :      String(255);
        Id_1382792638           :      String(255);
        Id_7210836827           :      String(255);
        Id_5883702383           :      String(255);
        Id_2189956614           :      String(255);
        Id_4766596929           :      String(255);
        Id_12101949121000000000 :      String(255);
        Id_1952201064           :      String(255);
        Id_22420638581000000000 :      String(255);
        Id_29836490261000000000 :      String(255);
        Id_3247886323           :      String(255);
        Id_7252571494           :      String(255);
        Id_7533098516           :      String(255);
        Id_76173296371000000000 :      String(255);
        Id_83976366111000000000 :      String(255);
        Id_9723174141           :      String(255);
        latestApprovalDate      :      DateTime;
        redFlags                : many String; // JSON array stored as string;
}

entity ActivityWeldingProcedureSpecification {
    key ID              :      UUID;
        projectId       :      associations.ProjectAssociation;
        projectName     :      String(100);
        departmentId    :      associations.DepartmentAssociation;
        departmentName  :      String(100);
        status          :      String(50); // Changed from Integer to String based on JSON value "1"
        submittedBy     :      String(100);
        formId          :      associations.FormAssociation;
        formName        :      String(100);
        serverUniqueId  :      String(100);
        displayName     :      Map; // Storing JSON array as a string
        recordID        :      String;
        submittedTime   :      DateTime;
        lastUpdatedDate :      DateTime;
        isDeleted       :      Boolean default false;
        qaQcStatus      :      String(50); // Renamed "QA/QC Status" to a valid field name

        Id_6102557215   :      String;
        Id_5071210219   :      String;
        Id_7355619789   :      String;
        Id_1387531777   :      Date;
        Id_2250222395   :      String;
        Id_1261261550   :      String;
        Id_6587948157   :      String;
        Id_4029124382   :      String;
        Id_9949844338   :      String;
        Id_3877348699   :      String;
        Id_4094272068   :      String;
        Id_2057866479   :      String;
        Id_8778158406   :      String;
        Id_2167870200   :      String;
        Id_2920110761   :      String;
        Id_3992585902   :      String;
        Id_6798939289   :      String;
        Id_1689308604   :      String;
        Id_1412358609   :      String;
        Id_3126043536   :      String;
        Id_8421080008   :      String;
        Id_5337853249   :      String;
        Id_8692744381   :      String;
        Id_9117242374   :      String;
        Id_3189740917   :      String;
        Id_4802259791   :      String;
        Id_9950244107   :      String;
        Id_2875124467   :      String;
        Id_8469098122   :      String;
        Id_5005594932   :      String;
        Id_9802330176   :      String;
        Id_5737962465   :      String;
        Id_4173490046   :      String;
        redFlags        : many String;
}

entity ActivityWeldingrepairactivity {
    key ID              :      UUID;
        projectId       :      associations.ProjectAssociation;
        projectName     :      String(100);
        departmentId    :      associations.DepartmentAssociation;
        departmentName  :      String(100);
        status          :      String;
        submittedBy     :      String(100);
        formId          :      associations.FormAssociation;
        formName        :      String(100);
        serverUniqueId  :      String(100);
        displayName     :      Map; // Storing JSON array as a string
        recordID        :      String;
        submittedTime   :      DateTime;
        lastUpdatedDate :      DateTime;
        isDeleted       :      Boolean default false;
        qaQcStatus      :      String(50); // Renamed "QA/QC Status" to a valid field name

        Id_8953245505   :      String(50); // Weld Joint Number
        Id_6712946157   :      String(50);
        Id_5149652242   :      String(255);
        Id_5684627329   :      String(255);
        Id_7594136553   :      String(50);
        Id_6215970277   :      String(50);
        Id_7982396301   :      String(50);
        Id_9597598803   :      String(50);
        Id_4053936148   :      String(255);
        Id_2298272901   :      String(50);
        Id_9210070257   :      String(50); // Date stored as string
        Id_4802155246   :      String(500); // File URL
        Id_7555712943   :      String(50);
        Id_9623700256   :      String(255);
        Id_2837429007   :      String(255);
        Id_6868213802   :      String(255);
        Id_1563872751   :      String(255);
        redFlags        : many String; // JSON array stored as string;
        Next_Step       :      String(255);
}
