#!/bin/bash

# SQLite Database Visualization Commands
# Run these commands to explore your database

DB_PATH="./data/documents.db"

echo "🗃️  SOP Document Manager - Database Visualization Commands"
echo "=========================================================="
echo ""

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    echo "❌ Database not found at $DB_PATH"
    exit 1
fi

echo "✅ Database found at: $DB_PATH"
echo ""

echo "🔍 BASIC DATABASE EXPLORATION:"
echo "------------------------------"
echo ""

echo "1. Show all tables:"
echo "   sqlite3 $DB_PATH \".tables\""
echo ""

echo "2. Show database schema:"
echo "   sqlite3 $DB_PATH \".schema\""
echo ""

echo "3. Show table structure (example - users table):"
echo "   sqlite3 $DB_PATH \".schema users\""
echo ""

echo "📊 DATA EXPLORATION COMMANDS:"
echo "-----------------------------"
echo ""

echo "4. Count records in each table:"
echo "   sqlite3 $DB_PATH \"SELECT 'users' as table_name, COUNT(*) as count FROM users"
echo "                    UNION SELECT 'documents', COUNT(*) FROM documents"
echo "                    UNION SELECT 'change_requests', COUNT(*) FROM change_requests\""
echo ""

echo "5. Show sample users:"
echo "   sqlite3 $DB_PATH -header -column \"SELECT id, name, email, role, department FROM users LIMIT 5\""
echo ""

echo "6. Show sample documents:"
echo "   sqlite3 $DB_PATH -header -column \"SELECT id, sop_name, document_code, status, department FROM documents LIMIT 5\""
echo ""

echo "7. Show document status distribution:"
echo "   sqlite3 $DB_PATH -header -column \"SELECT status, COUNT(*) as count FROM documents GROUP BY status ORDER BY count DESC\""
echo ""

echo "8. Show user roles distribution:"
echo "   sqlite3 $DB_PATH -header -column \"SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY count DESC\""
echo ""

echo "9. Show documents with their owners:"
echo "   sqlite3 $DB_PATH -header -column \"SELECT d.sop_name, u.name as owner_name, u.email"
echo "                    FROM documents d"
echo "                    JOIN document_owners do ON d.id = do.document_id"
echo "                    JOIN users u ON do.user_id = u.id"
echo "                    LIMIT 10\""
echo ""

echo "10. Show change requests with details:"
echo "    sqlite3 $DB_PATH -header -column \"SELECT cr.id, d.sop_name as document, cr.request_type, cr.status, cr.priority"
echo "                     FROM change_requests cr"
echo "                     JOIN documents d ON cr.document_id = d.id"
echo "                     LIMIT 10\""
echo ""

echo "🔥 QUICK EXECUTION - Run actual commands:"
echo "----------------------------------------"
echo ""

# Function to run a command with nice formatting
run_query() {
    local description="$1"
    local query="$2"
    
    echo "🔍 $description"
    echo "   Query: $query"
    echo ""
    sqlite3 "$DB_PATH" -header -column "$query"
    echo ""
    echo "----------------------------------------"
    echo ""
}

# Execute some basic queries
echo "Running basic data exploration..."
echo ""

run_query "Table Record Counts" "
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION SELECT 'documents', COUNT(*) FROM documents
UNION SELECT 'change_requests', COUNT(*) FROM change_requests
UNION SELECT 'countries', COUNT(*) FROM countries
UNION SELECT 'departments', COUNT(*) FROM departments
"

run_query "Document Status Distribution" "
SELECT status, COUNT(*) as count FROM documents 
GROUP BY status 
ORDER BY count DESC
"

run_query "User Roles Distribution" "
SELECT role, COUNT(*) as count FROM users 
GROUP BY role 
ORDER BY count DESC
"

run_query "Sample Documents" "
SELECT id, sop_name, document_code, status, department, country 
FROM documents 
LIMIT 5
"

run_query "Sample Users" "
SELECT id, name, email, role, department, country 
FROM users 
LIMIT 5
"

echo "✅ Database exploration complete!"
echo ""
echo "💡 To run more detailed queries, use the SQLite CLI directly:"
echo "   sqlite3 $DB_PATH"
echo "   Then type .help for more commands"
