import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface SeedPermission {
  name: string;
  description: string;
  status: boolean;
}

interface SeedRole {
  role_name: string;
  description: string;
  status: boolean;
}

async function seedRolesAndPermissions() {
  console.log('🌱 Starting roles and permissions seeding...');

  try {
    // 1. Seed Permissions
    console.log('📋 Seeding permissions...');
    const permissionsPath = path.join(__dirname, 'seeders', 'permmisions.json');
    const permissionsData: SeedPermission[] = JSON.parse(fs.readFileSync(permissionsPath, 'utf8'));

    const permissions = [];
    for (const permissionData of permissionsData) {
      // Check if permission exists
      let permission = await prisma.permmisions.findFirst({
        where: { name: permissionData.name },
      });

      if (permission) {
        // Update existing permission
        permission = await prisma.permmisions.update({
          where: { id: permission.id },
          data: {
            description: permissionData.description,
            status: permissionData.status,
          },
        });
      } else {
        // Create new permission
        permission = await prisma.permmisions.create({
          data: {
            name: permissionData.name,
            description: permissionData.description,
            status: permissionData.status,
          },
        });
      }
      permissions.push(permission);
      console.log(`  ✅ Permission: ${permission.name}`);
    }

    // 2. Seed Roles
    console.log('👥 Seeding roles...');
    const rolesData: SeedRole[] = [
      {
        role_name: 'SUPER_ADMIN',
        description: 'Super Administrator with all permissions',
        status: true,
      },
      {
        role_name: 'ADMIN',
        description: 'Administrator with most permissions',
        status: true,
      },
      {
        role_name: 'CASHIER',
        description: 'Cashier with basic register operations',
        status: true,
      },
      {
        role_name: 'SUPERVISOR',
        description: 'Supervisor with approval permissions',
        status: true,
      },
    ];

    const roles = [];
    for (const roleData of rolesData) {
      // Check if role exists
      let role = await prisma.roles.findFirst({
        where: { role_name: roleData.role_name },
      });

      if (role) {
        // Update existing role
        role = await prisma.roles.update({
          where: { id: role.id },
          data: {
            description: roleData.description,
            status: roleData.status,
          },
        });
      } else {
        // Create new role
        role = await prisma.roles.create({
          data: {
            role_name: roleData.role_name,
            description: roleData.description,
            status: roleData.status,
          },
        });
      }
      roles.push(role);
      console.log(`  ✅ Role: ${role.role_name}`);
    }

    // 3. Assign Permissions to Roles
    console.log('🔗 Assigning permissions to roles...');

    // Find roles
    const superAdminRole = roles.find(r => r.role_name === 'SUPER_ADMIN');
    const adminRole = roles.find(r => r.role_name === 'ADMIN');
    const cashierRole = roles.find(r => r.role_name === 'CASHIER');
    const supervisorRole = roles.find(r => r.role_name === 'SUPERVISOR');

    // Clear existing role permissions to avoid conflicts
    await prisma.role_permissions.updateMany({
      data: { status: false },
    });

    // Helper function to assign permissions to role
    const assignPermissionsToRole = async (role: any, rolePermissions: any[]) => {
      for (const permission of rolePermissions) {
        // Check if assignment exists
        const existingAssignment = await prisma.role_permissions.findFirst({
          where: {
            role_id: role.id,
            permission_id: permission.id,
          },
        });

        if (existingAssignment) {
          // Update existing assignment
          await prisma.role_permissions.update({
            where: { id: existingAssignment.id },
            data: { status: true },
          });
        } else {
          // Create new assignment
          await prisma.role_permissions.create({
            data: {
              role_id: role.id,
              permission_id: permission.id,
              status: true,
            },
          });
        }
      }
    };

    // SUPER_ADMIN: All permissions
    if (superAdminRole) {
      await assignPermissionsToRole(superAdminRole, permissions);
      console.log(`  ✅ SUPER_ADMIN assigned ${permissions.length} permissions`);
    }

    // ADMIN: Most permissions (except approval of some critical operations)
    if (adminRole) {
      const adminPermissions = permissions.filter(p => 
        !p.name.includes('canApprove') || p.name === 'canAproveAnullment'
      );
      await assignPermissionsToRole(adminRole, adminPermissions);
      console.log(`  ✅ ADMIN assigned ${adminPermissions.length} permissions`);
    }

    // CASHIER: Basic operations
    if (cashierRole) {
      const cashierPermissionNames = [
        'canCreateRegister',
        'canCreateInvoice',
        'canCreateAnullment',
        'canCreateDevolution',
      ];
      const cashierPermissions = permissions.filter(p => 
        cashierPermissionNames.includes(p.name)
      );
      await assignPermissionsToRole(cashierRole, cashierPermissions);
      console.log(`  ✅ CASHIER assigned ${cashierPermissions.length} permissions`);
    }

    // SUPERVISOR: Approval permissions
    if (supervisorRole) {
      const supervisorPermissionNames = [
        'canAproveAnullment',
        'canApproveDevolution',
        'canCreateReconciliation',
        'canApproveReconciliation',
        'canDisapproveReconciliation',
      ];
      const supervisorPermissions = permissions.filter(p => 
        supervisorPermissionNames.includes(p.name)
      );
      await assignPermissionsToRole(supervisorRole, supervisorPermissions);
      console.log(`  ✅ SUPERVISOR assigned ${supervisorPermissions.length} permissions`);
    }

    console.log('🎉 Roles and permissions seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Permissions created/updated: ${permissions.length}`);
    console.log(`   - Roles created/updated: ${roles.length}`);
    console.log(`   - Role-Permission assignments completed`);

  } catch (error) {
    console.error('❌ Error seeding roles and permissions:', error);
    throw error;
  }
}

// Execute if this file is run directly
if (require.main === module) {
  seedRolesAndPermissions()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { seedRolesAndPermissions };
