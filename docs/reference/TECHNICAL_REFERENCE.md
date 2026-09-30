# 🔧 Technical Reference - Class Management System

**Version**: 1.0  
**Created**: May 23, 2026  
**Status**: Production Ready

---

## 🎯 Integration Points

### 1. Admin Portal (admin-portal.html)

#### Class Setup Page
**Location**: Academic → Class Setup  
**Database Module**: `Academic_ClassSetup`  
**Table Used**: `public.classes`

**Form Fields**:
```html
Grade Level (text input)
Section Name (text input)
Assigned Class Teacher (text input)
Status (select: Active/Inactive)
```

**Operations**:
- ✅ Create: handleGenericSubmit() saves to classes table
- ✅ Read: renderGenericTable() loads from classes table
- ✅ Update: Direct table editor (admin can click fields)
- ✅ Delete: deleteGenericEntry() removes from database

#### Add Student Form
**Location**: Academic → Add Student  
**Class Field Type**: `class-dropdown`  
**Populated By**: `classHandler.populateClassDropdown('dyn-f3')`

**Behavior**:
```javascript
When user switches to "Add Student" page:
1. switchPage('Academic_AddStudent') called
2. Form built with class-dropdown type for f3 field
3. classHandler.populateClassDropdown('dyn-f3') called
4. Dropdown populated with active classes
5. Format: "Grade 10 - Section A"
```

---

### 2. Admissions Form (index.html)

#### Step 3: Academic Information
**Field**: "Apply for Class"  
**Element ID**: `applyClass`  
**Type**: HTML Select (dynamically populated)

**Initialization**:
```javascript
// In DOMContentLoaded event:
if (window.classHandler) {
  await window.classHandler.populateClassDropdown('applyClass');
}
```

**Display Format**: "Grade 10 - Section A"  
**Saved to**: `admission_applications.class_applying_for`

---

## 📦 ClassHandler API Reference

### Class: `ClassHandler`

#### Constructor
```javascript
new ClassHandler()
// Initializes with supabaseDb connection
// Sets cache duration to 5 minutes
```

#### Properties
```javascript
supabaseDb       // Reference to Supabase database
classesCache     // In-memory cache of active classes
cacheDuration    // 5 minutes (300000 ms)
lastCacheUpdate  // Timestamp of last cache update
```

#### Methods

##### getActiveClasses()
```javascript
// Gets all active classes with caching
// Returns: Promise<Array<ClassObject>>
const classes = await classHandler.getActiveClasses();

// Returns array of objects:
[
  {
    id: 1,
    display: "Grade 10 - Section A",
    grade_level: "Grade 10",
    section_name: "Section A",
    class_teacher: "Mr. Sharma",
    total_strength: 45,
    status: "Active",
    raw: { ...full database object... }
  }
]
```

##### getAllClasses()
```javascript
// Gets all classes including inactive
// Returns: Promise<Array<ClassObject>>
const allClasses = await classHandler.getAllClasses();
```

##### addClass(classData)
```javascript
// Adds new class to database
// Returns: Promise<{success: boolean, id?: number, error?: string}>

const result = await classHandler.addClass({
  grade_level: "Grade 10",        // Required
  section_name: "Section A",      // Required
  class_teacher: "Mr. Sharma",    // Optional
  class_teacher_code: "TC001",    // Optional
  total_strength: 45,             // Optional, default 0
  status: "Active",               // Optional, default "Active"
  notes: "..."                    // Optional
});

// Returns:
{
  success: true,
  id: 1,
  message: "Class \"Grade 10 - Section A\" added successfully!"
}
// OR on error:
{
  success: false,
  error: "Class \"Grade 10 - Section A\" already exists!"
}
```

##### updateClass(classId, classData)
```javascript
// Updates existing class
// Returns: Promise<{success: boolean, error?: string}>

const result = await classHandler.updateClass(1, {
  class_teacher: "Mrs. Paudel",
  total_strength: 42
});

// Returns:
{
  success: true,
  message: "Class updated successfully!"
}
```

##### deleteClass(classId)
```javascript
// Deletes class from database
// Returns: Promise<{success: boolean, error?: string}>

const result = await classHandler.deleteClass(1);

// Returns:
{
  success: true,
  message: "Class deleted successfully!"
}
```

##### populateClassDropdown(selectElementId)
```javascript
// Populates HTML select element with active classes
// Returns: Promise<boolean>

await classHandler.populateClassDropdown('applyClass');

// Creates <option> elements:
// <option value="">Select a class...</option>
// <option value="Grade 10 - Section A">Grade 10 - Section A</option>
// <option value="Grade 10 - Section B">Grade 10 - Section B</option>
// ...
```

##### getClassById(classId)
```javascript
// Gets single class by ID
// Returns: Promise<ClassObject | null>

const classData = await classHandler.getClassById(1);

// Returns:
{
  id: 1,
  grade_level: "Grade 10",
  section_name: "Section A",
  class_teacher: "Mr. Sharma",
  class_teacher_code: "TC001",
  total_strength: 45,
  status: "Active",
  notes: "..."
}
```

##### getClassesByGrade(gradeLevelText)
```javascript
// Gets all active classes for specific grade
// Returns: Promise<Array<ClassObject>>

const grade10Classes = await classHandler.getClassesByGrade("Grade 10");

// Returns:
[
  { id: 1, display: "Grade 10 - Section A", ... },
  { id: 2, display: "Grade 10 - Section B", ... }
]
```

##### searchClasses(searchTerm)
```javascript
// Searches classes by text
// Returns: Promise<Array<ClassObject>>

const results = await classHandler.searchClasses("Sharma");

// Returns all classes where grade_level, section_name,
// or class_teacher matches "Sharma"
```

##### getClassStatistics()
```javascript
// Gets class statistics
// Returns: Promise<StatisticsObject>

const stats = await classHandler.getClassStatistics();

// Returns:
{
  total_classes: 6,
  active_classes: 6,
  inactive_classes: 0,
  total_strength: 274,
  classes_with_teacher: 6
}
```

##### invalidateCache()
```javascript
// Clears the cache
// No parameters, no return value

classHandler.invalidateCache();
// Forces fresh fetch from database on next getActiveClasses()
```

---

## 📊 Database Schema Details

### Table: public.classes

```sql
CREATE TABLE public.classes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  grade_level TEXT NOT NULL,
  section_name TEXT NOT NULL,
  class_teacher TEXT,
  class_teacher_code TEXT,
  total_strength INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  UNIQUE(grade_level, section_name)
);
```

### Indexes
```sql
idx_classes_status       -- For filtering by status
idx_classes_grade_level  -- For filtering by grade
idx_classes_section      -- For filtering by section
```

### Triggers
```sql
trigger_update_classes_timestamp  -- Auto-updates updated_at
```

### Row-Level Security Policies
```
Allow SELECT: All authenticated users
Allow INSERT: All authenticated users
Allow UPDATE: All authenticated users
Allow DELETE: All authenticated users
```

---

## 🔌 Integration Code Examples

### Example 1: Add Class Setup to New Module

```html
<!-- In HTML form -->
<div class="form-group">
  <label for="class-select">Class</label>
  <select id="class-select" class="form-control"></select>
</div>

<!-- In JavaScript -->
<script>
  // When module loads:
  async function initializeModule() {
    if (window.classHandler) {
      await window.classHandler.populateClassDropdown('class-select');
    }
  }
</script>
```

### Example 2: Submit Form with Class Selection

```javascript
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const selectedClassDisplay = document.getElementById('applyClass').value;
  // Value: "Grade 10 - Section A"
  
  const classInfo = await window.classHandler.getActiveClasses();
  const selectedClass = classInfo.find(c => c.display === selectedClassDisplay);
  
  // Now you have full class info including teacher, strength, etc.
  console.log(selectedClass);
  
  // Send to database with other form data
  submitData({
    class_id: selectedClass.id,
    class_display: selectedClass.display,
    class_teacher: selectedClass.class_teacher,
    ...otherFormData
  });
}
```

### Example 3: Conditional Class Filtering

```javascript
// Show only Grade 10 classes
async function showGrade10Classes() {
  const grade10 = await classHandler.getClassesByGrade("Grade 10");
  console.log("Grade 10 sections:", grade10.length);
  
  // Populate dropdown with only Grade 10
  const select = document.getElementById('class-select');
  select.innerHTML = '<option value="">Select...</option>';
  
  grade10.forEach(cls => {
    const opt = document.createElement('option');
    opt.value = cls.display;
    opt.textContent = cls.display + ` (${cls.total_strength} students)`;
    select.appendChild(opt);
  });
}
```

### Example 4: Update Class on Student Added

```javascript
async function onStudentAdded(studentClass) {
  // studentClass: "Grade 10 - Section A"
  
  const allClasses = await classHandler.getActiveClasses();
  const targetClass = allClasses.find(c => c.display === studentClass);
  
  if (targetClass) {
    // Update strength
    const newStrength = (targetClass.total_strength || 0) + 1;
    const result = await classHandler.updateClass(targetClass.id, {
      total_strength: newStrength
    });
    
    if (result.success) {
      console.log("Class strength updated!");
      classHandler.invalidateCache(); // Refresh cache
    }
  }
}
```

---

## 🚨 Error Handling

### Common Errors & Solutions

```javascript
// Error 1: ClassHandler not initialized
if (!window.classHandler) {
  console.warn("ClassHandler not ready, retrying...");
  setTimeout(() => populateDropdown(), 1000);
}

// Error 2: Duplicate class
try {
  const result = await classHandler.addClass({...});
  if (!result.success && result.error.includes("unique")) {
    alert("This class already exists! Use update instead.");
  }
} catch (error) {
  console.error("Error adding class:", error);
}

// Error 3: Database connection failed
const classes = await classHandler.getActiveClasses();
if (classes.length === 0) {
  console.warn("No classes found or database error");
  // Fallback to localStorage or static data
}
```

---

## 📈 Performance Considerations

### Caching Strategy
- **Duration**: 5 minutes
- **Cache Key**: Active classes array
- **Cache Invalidation**: Automatic on add/update/delete
- **Manual Clear**: `classHandler.invalidateCache()`

### Optimization Tips
```javascript
// ✅ Good: Reuse cached data
const classes = await classHandler.getActiveClasses();
const classes2 = await classHandler.getActiveClasses(); // Uses cache

// ❌ Bad: Force database query every time
classHandler.invalidateCache();
const classes1 = await classHandler.getActiveClasses();
classHandler.invalidateCache();
const classes2 = await classHandler.getActiveClasses();

// ✅ Good: Batch operations
Promise.all([
  classHandler.addClass(class1),
  classHandler.addClass(class2),
  classHandler.addClass(class3)
])
```

---

## 🧪 Testing Code

```javascript
// Test suite
async function testClassHandler() {
  console.log("Testing ClassHandler...");
  
  try {
    // Test 1: Get active classes
    const classes = await classHandler.getActiveClasses();
    console.assert(Array.isArray(classes), "getActiveClasses should return array");
    console.log("✅ Test 1 passed");
    
    // Test 2: Add class
    const addResult = await classHandler.addClass({
      grade_level: "Test Grade",
      section_name: "Test Section"
    });
    console.assert(addResult.success, "addClass should succeed");
    console.log("✅ Test 2 passed");
    
    // Test 3: Update class
    const updateResult = await classHandler.updateClass(addResult.id, {
      total_strength: 50
    });
    console.assert(updateResult.success, "updateClass should succeed");
    console.log("✅ Test 3 passed");
    
    // Test 4: Delete class
    const deleteResult = await classHandler.deleteClass(addResult.id);
    console.assert(deleteResult.success, "deleteClass should succeed");
    console.log("✅ Test 4 passed");
    
    // Test 5: Populate dropdown
    const populateResult = await classHandler.populateClassDropdown('applyClass');
    console.assert(populateResult !== false, "populateClassDropdown should succeed");
    console.log("✅ Test 5 passed");
    
    console.log("✅ All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run: testClassHandler()
```

---

## 📋 Deployment Checklist

- [ ] Run classes-setup.sql on Supabase
- [ ] Verify classes table created successfully
- [ ] Add sample classes via Admin Portal
- [ ] Test class dropdown in Add Student
- [ ] Test class dropdown in Admissions form
- [ ] Test adding new class and verifying it appears immediately
- [ ] Test deleting class and verifying it disappears
- [ ] Reload page and verify persistence
- [ ] Test with multiple concurrent users
- [ ] Monitor browser console for errors
- [ ] Verify Supabase RLS policies working
- [ ] Deploy to production

---

## 📞 Support Resources

- **Main Guide**: DYNAMIC_CLASS_SETUP_GUIDE.md
- **User Guide**: CLASS_SETUP_GUIDE.md
- **Summary**: IMPLEMENTATION_SUMMARY.md
- **SQL Schema**: classes-setup.sql
- **Code**: class-handler.js

---

**End of Technical Reference**
