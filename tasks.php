  <?php
  $servername = "localhost";
  $username = "root";
  $password = "";
  $dbname = "app";
  
  // Create connection
  $conn = new mysqli($servername, $username, $password, $dbname);
  
  // Check connection
  if ($conn->connect_error) {
      die("Connection failed: " . $conn->connect_error);
  }
  
  // Set the content type to JSON
  header('Content-Type: application/json');
  
  // Handle different HTTP methods
  $method = $_SERVER['REQUEST_METHOD'];
  
  switch ($method) {
      case 'GET':
          // Retrieve tasks
          getTasks($conn);
          break;
  
      case 'POST':
          // Add a new task
          addTask($conn);
          break;
  
      case 'PUT':
          // Update task completion status or task name
          updateTask($conn);
          break;
  
      case 'DELETE':
          // Delete a task
          deleteTask($conn);
          break;
  
      default:
          // Invalid method
          http_response_code(405); // Method Not Allowed
          echo json_encode(['error' => 'Invalid method']);
          break;
  }
  
  // Close the database connection
  $conn->close();
  
  function getTasks($conn) {
      $result = $conn->query("SELECT * FROM tasks");
  
      if ($result->num_rows > 0) {
          $tasks = [];
          while ($row = $result->fetch_assoc()) {
              $tasks[] = [
                  'id' => $row['id'],
                  'task_name' => $row['task_name'],
                  'completed' => $row['completed'],
                  'details' => $row['details'],
                  'created_at' => $row['created_at'],
                  'updated_at' => $row['updated_at'],
              ];
          }
          echo json_encode($tasks);
      } else {
          echo json_encode([]);
      }
  }
  
  function addTask($conn) {
      $data = json_decode(file_get_contents('php://input'), true);
  
      if (isset($data['taskName'])) {
          $taskName = $conn->real_escape_string($data['taskName']);
          $details = $conn->real_escape_string($data['details']);
  
          $sql = "INSERT INTO tasks (task_name, details) VALUES ('$taskName', '$details')";
  
          if ($conn->query($sql) === TRUE) {
              echo json_encode(['success' => true]);
          } else {
              echo json_encode(['success' => false, 'error' => $conn->error]);
          }
      } else {
          echo json_encode(['success' => false, 'error' => 'Missing taskName parameter']);
      }
  }
  
  function updateTask($conn) {
      $data = json_decode(file_get_contents('php://input'), true);
  
      if (isset($_GET['id'])) {
          $taskId = $conn->real_escape_string($_GET['id']);
  
          if (isset($data['status'])) {
              // Update completion status
              $status = $conn->real_escape_string($data['status']);
              $sql = "UPDATE tasks SET completed='$status' WHERE id='$taskId'";
          } elseif (isset($data['taskName'])) {
              // Update task name
              $taskName = $conn->real_escape_string($data['taskName']);
              $sql = "UPDATE tasks SET task_name='$taskName' WHERE id='$taskId'";
          } else {
              echo json_encode(['success' => false, 'error' => 'Missing parameters']);
              return;
          }
  
          if ($conn->query($sql) === TRUE) {
              echo json_encode(['success' => true]);
          } else {
              echo json_encode(['success' => false, 'error' => $conn->error]);
          }
      } else {
          echo json_encode(['success' => false, 'error' => 'Missing id parameter']);
      }
  }
  
  function deleteTask($conn) {
      if (isset($_GET['id'])) {
          $taskId = $conn->real_escape_string($_GET['id']);
  
          $sql = "DELETE FROM tasks WHERE id='$taskId'";
  
          if ($conn->query($sql) === TRUE) {
              echo json_encode(['success' => true]);
          } else {
              echo json_encode(['success' => false, 'error' => $conn->error]);
          }
      } else {
          echo json_encode(['success' => false, 'error' => 'Missing id parameter']);
      }
  }
  ?>