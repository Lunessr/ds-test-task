import { MigrationInterface, QueryRunner } from 'typeorm';

export class StartingMigration1670518530528 implements MigrationInterface {
  name = 'StartingMigration1670518530528';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`full_name\` varchar(100) COLLATE "utf8mb4_unicode_ci" NOT NULL, \`birth_date\` date NOT NULL, \`email\` varchar(200) NOT NULL, \`uaid\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`activity_status\` int NULL, UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), UNIQUE INDEX \`IDX_c5d6c89440fe1b78b20183e806\` (\`uaid\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_status_code\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_activity_status\` enum ('active', 'suspended', 'archived') NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD CONSTRAINT \`FK_26ced29f734efa118b81106a241\` FOREIGN KEY (\`activity_status\`) REFERENCES \`user_status_code\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`DROP PROCEDURE IF EXISTS reactivateUserAccount`);
    await queryRunner.query(`DROP PROCEDURE IF EXISTS suspendUserAccount`);
    await queryRunner.query(`DROP PROCEDURE IF EXISTS removeUserAccount`);
    await queryRunner.query(`DROP PROCEDURE IF EXISTS updateUserAccount`);
    await queryRunner.query(`DROP PROCEDURE IF EXISTS getUserBy`);
    await queryRunner.query(`DROP PROCEDURE IF EXISTS getAllUsers`);
    await queryRunner.query(`DROP PROCEDURE IF EXISTS addUserAccount`);
    await queryRunner.query(
      `DROP PROCEDURE IF EXISTS getUserStatusCodeByStatus`,
    );
    await queryRunner.query(
      `INSERT INTO user_status_code (user_activity_status) VALUES ('active')`,
    );
    await queryRunner.query(
      `INSERT INTO user_status_code (user_activity_status) VALUES ('suspended')`,
    );
    await queryRunner.query(
      `INSERT INTO user_status_code (user_activity_status) VALUES ('archived')`,
    );
    await queryRunner.query(
      `CREATE PROCEDURE getUserStatusCodeByStatus(IN status CHAR(100))
                  BEGIN
                      SELECT * FROM user_status_code WHERE user_activity_status=status;
                  END `,
    );
    await queryRunner.query(
      `CREATE PROCEDURE addUserAccount(IN full_name CHAR(100), birth_date CHAR(100), email CHAR(200), uaid CHAR(24), status int(100))
            BEGIN
                DECLARE EXIT HANDLER FOR SQLEXCEPTION
                BEGIN
                    ROLLBACK;
                END;
                START TRANSACTION;
                    INSERT INTO user (full_name, birth_date, email, uaid, activity_status) 
                    VALUES (full_name, birth_date, email, uaid, status);
                COMMIT;
            END`,
    );
    await queryRunner.query(
      `CREATE PROCEDURE getAllUsers() 
            BEGIN
                SELECT *  FROM user
                LEFT JOIN user_status_code
                ON user.activity_status = user_status_code.user_activity_status
                WHERE NOT user_activity_status = 'archived';
            END`,
    );
    await queryRunner.query(
      `CREATE PROCEDURE getUserBy(IN value CHAR(200))
                        BEGIN
                            SELECT * FROM user
                            LEFT JOIN user_status_code
                            ON user.activity_status = user_status_code.user_activity_status
                            WHERE uaid=value OR email=value;
                        END`,
    );
    await queryRunner.query(
      `CREATE PROCEDURE updateUserAccount(IN new_email CHAR(200), id CHAR(24))
                          BEGIN
                          DECLARE EXIT HANDLER FOR SQLEXCEPTION
                        BEGIN
                            ROLLBACK;
                        END;
                        START TRANSACTION;
                            UPDATE user SET email=new_email WHERE uaid=id;
                            COMMIT;
                          END`,
    );
    await queryRunner.query(
      `CREATE PROCEDURE removeUserAccount(IN id CHAR(24), new_status int(100))
                        BEGIN
                        DECLARE EXIT HANDLER FOR SQLEXCEPTION
                        BEGIN
                            ROLLBACK;
                        END;
                        START TRANSACTION;
                          UPDATE user SET activity_status=new_status WHERE uaid=id;
                          COMMIT;
                        END`,
    );
    await queryRunner.query(
      `CREATE PROCEDURE suspendUserAccount(IN id CHAR(24), new_status int(100))
                        BEGIN
                        DECLARE EXIT HANDLER FOR SQLEXCEPTION
                        BEGIN
                            ROLLBACK;
                        END;
                        START TRANSACTION;
                          UPDATE user SET activity_status=new_status WHERE uaid=id;
                          COMMIT;
                        END`,
    );
    await queryRunner.query(
      `CREATE PROCEDURE reactivateUserAccount(IN id CHAR(24), new_status int(100))
                        BEGIN
                        DECLARE EXIT HANDLER FOR SQLEXCEPTION
                        BEGIN
                            ROLLBACK;
                        END;
                        START TRANSACTION;
                          UPDATE user SET activity_status=new_status WHERE uaid=id;
                          COMMIT;
                        END`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP PROCEDURE IF EXISTS getUserStatusCodeByStatus`,
    );
    await queryRunner.query(`DROP PROCEDURE IF EXISTS reactivateUserAccount`);
    await queryRunner.query(`DROP PROCEDURE IF EXISTS suspendUserAccount`);
    await queryRunner.query(`DROP PROCEDURE IF EXISTS removeUserAccount`);
    await queryRunner.query(`DROP PROCEDURE IF EXISTS updateUserAccount`);
    await queryRunner.query(`DROP PROCEDURE IF EXISTS getUserBy`);
    await queryRunner.query(`DROP PROCEDURE IF EXISTS getAllUsers`);
    await queryRunner.query(`DROP PROCEDURE IF EXISTS addUserAccount`);

    await queryRunner.query(
      `ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_26ced29f734efa118b81106a241\``,
    );
    await queryRunner.query(`DROP TABLE \`user_status_code\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_c5d6c89440fe1b78b20183e806\` ON \`user\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``,
    );
    await queryRunner.query(`DROP TABLE \`user\``);
  }
}
