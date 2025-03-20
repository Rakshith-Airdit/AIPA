namespace AIPA;

service CommonServices {
    entity UserCount {
        key roles            : String;
            departments      : String;
            totalRoles       : Int32;
            totalDepartments : Int32;
            filterType       : String;
    }

    entity getTotalUserCount {
        key data : String;
    }
}
