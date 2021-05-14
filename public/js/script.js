$(document).ready(function () {
  let count = 0;

  function objectifyForm(formArray) {
    //serialize data function
    var returnArray = {};
    for (var i = 0; i < formArray.length; i++) {
      returnArray[formArray[i]["name"]] = formArray[i]["value"];
    }
    return returnArray;
  }

  $("#add_product_sub").click(function () {
    let i = 1;
    const facetList = [];
    const body = objectifyForm($("#productForm").serializeArray());
    facetList.push({ property: "product_type", value: body["product_type"] });
    while (i <= count) {
      facetList.push({
        property: $(`#prop_name${i}`).val(),
        value: $(`#prop_val${i}`).val(),
      });

      i++;
    }

    body["facet"] = facetList;

    console.log(body);

    $.ajax({
      url: "/product", // url where to submit the request
      type: "POST", // type of action POST || GET
      dataType: "json", // data type
      data: body, // post data || get data
      success: function (data) {
        $("#error_msg").empty();
        $("#exampleModalLong").hide();
        $("#prod_modal_dialog").hide();
        location.reload();
        console.log("rfed");
      },
      error: function () {
        $("#error_msg").empty();
        $("#error_msg").append(
          "<p>Error! Please enter a valid data to add the product.</p>"
        );
        console.log("rfd");
      },
    });
  });

    $("#add_property").click(function () {
    count = count + 1;
    const divTag = $("#properties");
    const add = `\
    <label for='name'>Property ${count}  Name </label>\
    <input type='text' name='name' class='form-control' id = 'prop_name${count}'>\
    <label for='value'>Property ${count} Value</label>\
    <input type='text' name='value' class='form-control' id = 'prop_val${count}'>`;

    divTag.append(add);
  });

    $('.delete_product').on('click', function(e) {
        var id = $(this).attr('data-id');
        $.ajax({
            url: '/product/'+ id, // url where to submit the request
            type : "delete", // type of action POST || GET
            dataType : 'json', // data type
            // data : id, // post data || get data
            success : function(data) {
            //    alert("deleted");
                location.reload();
            },
            error: function() {
                
            }
        })
    });

    $('.product_click').on('click', function(e) {
        var id = $(this).attr('data-id');
        $.ajax({
            url: '/products/product/'+ id, // url where to submit the request
            type : "GET", // type of action POST || GET
            success : function(data) {
                window.location.href = 'http://localhost:3000/products/product/'+id;
            },
            error: function() {
                
            }
        })
    });

    $('.buy_now').on('click', function(e) {
        var id = $(this).attr('data-id');
        alert("Product has beed added to Cart");
        $.ajax({
            url: '/product/addtocart/'+ id, // url where to submit the request
            type : "patch", // type of action POST || GET
            success : function(data) {
                console.log('now');
                window.location.href = 'http://localhost:3000/products/product/'+id;
            },
            error: function() {
            }
        })
    });

    $('.add_review').on('click', function(e) {
        alert('dssadasf')
        var id = $(this).attr('data-id');
        $.ajax({
            url: '/product/comment/'+ id, // url where to submit the request
            type : "patch", // type of action POST || GET
            success : function(data) {
            alert('dsfdfsf');
            window.location.href = 'http://localhost:3000/products/product/'+id;
            },
            error: function() {
                
            }
        })
    });

    $('.product_like').on('click', function(e) {
        var id = $(this).attr('data-id');
        alert("cvcvcc");
        $.ajax({
            url: '/product/like/'+ id, // url where to submit the request
            type : "patch", // type of action POST || GET
            success : function(data) {
                alert('now');
                window.location.href = 'http://localhost:3000/products/product/'+id;
            },
            error: function() {
            }
        })
    });

    $('#cart_btn').on('click', function(e) {
        var id = "609a9ffbe959bc914a4a5655";
        alert("eyreuty");
        $.ajax({
            url: '/product/addtocart/'+ id, // url where to submit the request
            type : "patch", // type of action POST || GET
            success : function(data) {
                alert('noxvcxvw');
                window.location.href = 'http://localhost:3000/product/addtocart/'+id;
            },
            error: function() {
            }
        })
    });


  
});
