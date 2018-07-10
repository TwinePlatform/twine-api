# Permissions

## permission flags
*-children - data of all child catagories  
*-parent - data of all parent catagories  
*-own - data directly owned by user  

## resources

### constants
constants (sectors/regions/gender/outreach types/meeting types/etc)

### organisations
organisations_details  
organisations_subscriptions  
organisations_feedback  
organisations_training  
organisations_invitations  
organisations_outreach  

### users
users_details  
users_details_anonymised //not currently used but may be needed for funding bodies to access anonymised user datas  

### volunteers
volunteer_activities  
volunteer_logs  

### visit_activities
visit_activites  
visit_logs  

## Permissions module
Permissions and roles will have a many to many relationship documented in the datebase under the `role_permission` linking table.
Roles and users will have a many to many relationship documented in the database under the `user_account_access_role` linking table.
A module can be created for easily updating and checking these relationships.

```
const Permissions = require('./permissions');
const Roles = require('./roles');
const User = require('../user');

// Permissions.grant :: Resource -> Operation -> PermissionLevel -> Role -> Promise ()
// Permissions.revoke :: Resource -> Operation -> PermissionLevel -> Role -> Promise ()
// Permissions.grantAll :: Resource -> Role -> Promise ()
// Permissions.revokeAll :: Resource -> Role -> Promise ()
// Permissions.roleHas :: Resource -> Operation -> PermissionLevel -> Role -> Promise Boolean
// Permissions.userHas :: Resource -> Operation -> PermissionLevel -> User -> Promise Boolean

// Roles.add :: Role -> User -> Promise ()
// Roles.remove :: Role -> User -> Promise ()
// Roles.move :: Role -> Role -> User -> Promise ()
// Roles.removeUserFromAll :: User -> Promise ()
// Roles.hasPermission :: Permission -> Promise Boolean
// Roles.userHas :: User -> Promise Boolean

// Examples:
Permissions.grant(Resouce.ORG_DETAILS_CHILD, Permission.WRITE, Roles.ORG_ADMIN);
Permissions.revoke(Resource.VOLUNTEER_LOGS_OWN, Permissions.DELETE, Roles.VOLUNTEER);

User.byId(1).then(user => Roles.add(Roles.VOLUNTEER, user));
User.byEmail('foo@bar.com').then(user => Roles.remove(Roles.VISITOR, user));

```

## References

- [Best practices for an authentication system](https://cybersecurity.ieee.org/blog/2016/06/02/design-best-practices-for-an-authentication-system/)
- [Authorization and authentication in microservices](https://initiate.andela.com/how-we-solved-authentication-and-authorization-in-our-microservice-architecture-994539d1b6e6)
- [Access control in nodejs](https://blog.nodeswat.com/implement-access-control-in-node-js-8567e7b484d1)
- [Designing an enterprise RBAC system](https://hackernoon.com/designing-an-enterprise-role-based-access-control-rbac-system-96e645c659b7)
- [How To Structure Permissions In A SaaS App](https://heapanalytics.com/blog/engineering/structure-permissions-saas-app)
