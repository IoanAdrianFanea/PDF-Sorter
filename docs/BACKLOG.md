# File which includes potential additions in future


## Language and Timezone
Remove language and timezone fields from User schema (stakeholder confirmed single language)

## Resetting Password upon creation (ADMIN created)
Add resetUponLogin field to user to require freshly made users to reset their password

## Recycling Bin
When a project is deleted, move documents to a recycling bin rather than 
permanently deleting them. Documents and the project should be restorable. 
For now, deletion is permanent.

## Project Deletion Cascade
Deleting a project currently deletes all documents and files permanently. 
Revisit once recycling bin feature is designed.