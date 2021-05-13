$(document).ready(function () {
  const productTypes_dropdown = $("#displayProp");
  const filterDiv = $("#filterDiv");

  //ref:https://stackoverflow.com/questions/5524045/jquery-non-ajax-post
  function submit(action, method, values) {
    var form = $("<form/>", {
      action: action,
      method: method,
    });
    $.each(values, function () {
      form.append(
        $("<input/>", {
          type: "hidden",
          name: this.name,
          value: this.value,
        })
      );
    });
    form.appendTo("body").submit();
  }

  $.ajax({
    url: "/producttypes",
    type: "GET",
    dataType: "json",
    success: function (data) {
      productTypes_dropdown.empty();
      console.log(data);
      for (i of data) {
        const temp = `<button type="button" class="dropdown-item" value="${i}">${i}</button>`;
        productTypes_dropdown.append(temp);
      }
    },
    error: function () {
      console.log("fdcsxz");
    },
  });

  $(document).on("click", "#search_submit", function (e) {
    const searchTerm = $("#search_bar").val();
    submit(`/search/${searchTerm}`, "GET", []);
  });

  $(document).on("click", ".dropdown-item", function (e) {
    const product_type = $(this).val();
    filterDiv.empty();
    $.ajax({
      url: `/properties/${product_type}`,
      type: "GET",
      dataType: "json",
      success: function (data) {
        let formData = `<form id ="filterData">`;
        for (prop of data) {
          if (prop.type == "number") {
            formData =
              formData +
              `
            <div>
            <label for ="${prop.name}"> ${prop.name} (max value)</label>
            <input type = "number" id = "${prop.name}"name= "${prop.name}">
            </div>`;
          } else {
            formData =
              formData +
              `
              <div>
              <label for ="${prop.name}"> ${prop.name}</label>
              <input type = "text" id = "${prop.name}"name= "${prop.name}">
              </div>`;
          }
        }

        formData =
          formData + `<input type="button" value="filter" id="filterButton" />`;

        formData =
          formData +
          `<input type="hidden" value="${product_type}" name="product_type">`;

        formData = formData + `</form>`;
        filterDiv.append(formData);
      },
      error: function () {
        console.log("fdcsxz");
      },
    });
  });

  $(document).on("click", "#filterButton", function (e) {
    const filterData = $("#filterData").serializeArray();

    console.log(filterData);
    const updatedData = [];

    for (i of filterData) {
      if (i.value == "") {
        continue;
      }
      updatedData.push(i);
    }
    console.log(updatedData);
    submit("/filter", "POST", updatedData);
  });

  $(document).on("click", "#search_submit", function () {
    console.log("frnm d");
    const searchTerm = $("#search_bar").val();
    console.log(searchTerm);
    submit(`/search/${searchTerm}`, "GET", [{ name: "d", value: "csx" }]);
  });
});
