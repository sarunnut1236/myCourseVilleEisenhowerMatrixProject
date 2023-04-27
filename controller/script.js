// TODO #4.0: Change this IP address to EC2 instance public IP address when you are going to deploy this web application
const backendIPAddress = "127.0.0.1:3000";

const authorizeApplication = () => {
  window.location.href = `http://${backendIPAddress}/courseville/auth_app`;
};

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

const get_all_assignments_doable = async() => {
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
          console.log(dd[i].duetime*1000, Date.now(), parseInt(dd[i].duetime)*1000 > Date.now());
          if (parseInt(dd[i].duetime)*1000 > Date.now()) {
            assignments.push(dd[i]);
          }
        }
      })
      .catch((error) => console.error(error));
  }
  console.log(assignments);
}


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