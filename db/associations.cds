namespace AIPALocal.db.Associations;

using {
    Common.Forms as FormsEntity,
    Common.Departments as DepartmentEntity,
    Common.Users as UsersEntity,
    Common.Projects as ProjectsEntity,
    Common.Vendors as VendorsEntity
} from './common';


// One-to-One Associations
type ProjectAssociation         : Association to one ProjectsEntity;
type UserAssociation            : Association to one UsersEntity;
type DepartmentAssociation      : Association to one DepartmentEntity;
type FormAssociation            : Association to one FormsEntity;
type VendorAssociation          : Association to one VendorsEntity;
// One-to-Many Associations
type ManyUsersAssociation       : Association to many UsersEntity;
type ManyFormsAssociation       : Association to many FormsEntity;
type ManyDepartmentsAssociation : Association to many DepartmentEntity;
type ManyProjectsAssociation    : Association to many ProjectsEntity;
type ManyVendorsAssociation     : Association to many VendorsEntity;
