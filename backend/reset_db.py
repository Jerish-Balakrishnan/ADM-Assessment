from database import engine
import models

print("Dropping all tables...")
models.Base.metadata.drop_all(bind=engine)
print("Recreating all tables with new schema...")
models.Base.metadata.create_all(bind=engine)
print("Schema reset successful.")
