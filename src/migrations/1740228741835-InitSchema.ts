import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1740228741835 implements MigrationInterface {
  name = 'InitSchema1740228741835';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "name" character varying NOT NULL, "password" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "location" ("id" SERIAL NOT NULL, "city" character varying(60) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_876d7bdba03c72251ec4c2dc827" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ae9cc28fa716b66a5288c86a94" ON "location" ("city") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_874961d4cadddaafd973991c82" ON "location" ("userId", "city") `,
    );
    await queryRunner.query(
      `ALTER TABLE "location" ADD CONSTRAINT "FK_bdef5f9d46ef330ddca009a8596" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "location" DROP CONSTRAINT "FK_bdef5f9d46ef330ddca009a8596"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_874961d4cadddaafd973991c82"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ae9cc28fa716b66a5288c86a94"`,
    );
    await queryRunner.query(`DROP TABLE "location"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
