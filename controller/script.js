// TODO #4.0: Change this IP address to EC2 instance public IP address when you are going to deploy this web application
const backendIPAddress = "127.0.0.1:3000";

const authorizeApplication = () => {
  window.location.href = `http://${backendIPAddress}/courseville/auth_app`;
};

var user;
var userTasks; //main
var userTaskFromDB; //temp
var userTaskFromCV; //temp
var foundUserTaskFromDB;

function onLoad() {
  getUserProfile();
  document.getElementById("username").innerHTML = `${user.firstname_en} ${user.lastname_en}`;
}

const clearUndoableTask = async () => {
  var newUserTasks = [];
  for (var i=0;i<userTasks.length;i++) {
    if (userTasks[i].duetime*1000 > Date.now()) {
      newUserTasks.push(userTasks[i]);
    }
  }
  userTasks = newUserTasks;
}

const addUserTaskToDB = async () => {
  //apparently you can overwrite things in dynamoDB
  const options = {
    method: "POST",
    credentials : "include",
    headers: {
      "Content-Type" : "application/json",
    },
    body: JSON.stringify({
      "id": user.id,
      "task": userTasks,
    })
  };
  await fetch(`http://${backendIPAddress}/items/addUserTasks`, options)
    .then((response) => response.json())
    .catch((error) => console.error(error));
}

const updateUserTaskWithCV = async () => {
  //call when want to update new task from cv into userTasks
  await getUserTaskFromCV();
  var latestCreateDate = 0;
  for (var i=0;i<userTasks.length;i++) {
    if (userTasks[i].created > latestCreateDate) {
      latestCreateDate = userTasks[i].created;
    }
  }

  for (var i=0;i<userTaskFromCV.length;i++) {
    if (userTaskFromCV[i].created > latestCreateDate) {
      var tmp = userTaskFromCV[i];
      tmp.importance = 0;
      userTasks.push(tmp);
    }
  }
}

const getUserTask = async () => {
  foundUserTaskFromDB = false;
  await getUserTaskFromDB();
  if (foundUserTaskFromDB) {
    userTasks = userTaskFromCV;
  } else {
    userTasks = [];
    await updateUserTaskWithCV();
  }
}

const getUserTaskFromDB = async () => {
  const options = {
    method: "GET",
    credentials: "include",
  };
  await fetch(
    `http://${backendIPAddress}/items/data`,
    options
  )
    .then((response) => response.json())
    .then((data) => {
      for (var i=0; i<data.length; i++) {
        if (data[i].id == user.id) {
          userTaskFromDB = data[i].task;
          foundUserTaskFromDB = true;
          break;
        }
      }
    },)
    .catch((error) => console.error(error));
}

const getUserTaskFromCV = async() => {
  var coursesThisYear = [];
  const options = {
    method: "GET",
    credentials: "include",
  };
  await fetch(
    `http://${backendIPAddress}/courseville/get_courses`,
    options
  )
    .then((response) => response.json())
    .then((data) => data.data.student)
    .then((courses) => {
      console.log(courses);
      for (var i=0; i<courses.length; i++) {
        if (courses[i].year == "2022" && courses[i].semester == 2) {
          coursesThisYear.push(courses[i]);
        }
      }
    })
    .catch((error) => console.error(error));
  console.log(coursesThisYear);
  var assignments = [];
  for (let i=0;i<coursesThisYear.length;i++) {
    // const options = {
    //   method: "GET",
    //   credentials: "include",
    // };
    await fetch(
      `http://${backendIPAddress}/courseville/get_course_assignments/${coursesThisYear[i].cv_cid}`,
      options
    )
      .then((response) => response.json())
      .then((data) => data.data)
      .then((dd) => {
        console.log(dd);
        for (let i=0;i<dd.length;i++) {
          // console.log(dd[i].duetime*1000, Date.now(), parseInt(dd[i].duetime)*1000 > Date.now());
          if (parseInt(dd[i].duetime)*1000 > Date.now()) {
            assignments.push(dd[i]);
          }
        }
      })
      .catch((error) => console.error(error));
  }
  userTaskFromCV = assignments;
}

// TODO #3.1: Change group number
const getGroupNumber = () => {
  return 99;
};

// Example: Send Get user profile ("GET") request to backend server and show the response on the webpage
const getUserProfile = async () => {
  const options = {
    method: "GET",
    credentials: "include",
  };
  await fetch(
    `http://${backendIPAddress}/courseville/get_profile_info`,
    options
  )
    .then((response) => response.json())
    .then((data) => {
      user = data.user;
      console.log(data.user);
      document.getElementById(
        "eng-name-info"
      ).innerHTML = `${data.user.title_en} ${data.user.firstname_en} ${data.user.lastname_en}`;
      document.getElementById(
        "thai-name-info"
      ).innerHTML = `${data.user.title_th} ${data.user.firstname_th} ${data.user.lastname_th}`;
    })
    .catch((error) => console.error(error));
};

// TODO #3.3: Send Get Courses ("GET") request to backend server and filter the response to get Comp Eng Ess CV_cid
//            and display the result on the webpage
const getCompEngEssCid = async () => {
  // document.getElementById("ces-cid-value").innerHTML = "";
  var ces_course_no = "2110221";
  const options = {
    method: "GET",
    credentials: "include",
  };
  await fetch(
    `http://${backendIPAddress}/courseville/get_courses`,
    options
  )
    .then((response) => response.json())
    .then((data) => data.data.student)
    .then((courses) => {
      console.log(courses);
      for (var i=0; i<courses.length; i++) {
        if (courses[i].course_no == ces_course_no) {
          document.getElementById("ces-cid-value").innerHTML = courses[i].cv_cid;
          break;
        }
      }
    })
    .catch((error) => console.error(error));
};



// TODO #3.5: Send Get Course Assignments ("GET") request with cv_cid to backend server
//            and create Comp Eng Ess assignments table based on the response (itemid, title)
const createCompEngEssAssignmentTable = async () => {
  const table_body = document.getElementById("main-table-body");
  table_body.innerHTML = "";
  const cv_cid = document.getElementById("ces-cid-value").innerHTML;

  const options = {
    method: "GET",
    credentials: "include",
  };
  var items;
  await fetch(
    `http://${backendIPAddress}/courseville/get_course_assignments/${cv_cid}`,
    options
  )
    .then((response) => response.json())
    .then((data) => {
      items = data.data;
    })
    .catch((error) => console.error(error));
  
  items.map((item) => {
    table_body.innerHTML += `
      <tr id="${item.itemid}">
        <td>${item.itemid}</td>
        <td>${item.title}</td>
      </tr>
    `;
  })
  // console.log(
  //   "This function should fetch 'get course assignments' route from backend server and show assignments in the table."
  // );
};

const logout = async () => {
  window.location.href = `http://${backendIPAddress}/courseville/logout`;
};

document.getElementById("group-id").innerHTML = getGroupNumber();
