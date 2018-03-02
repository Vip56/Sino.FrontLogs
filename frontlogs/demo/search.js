var app=angular.module('myapp',['ng','tm.pagination']);

app.controller('myCtrl',['$scope','$http',function ($scope,$http) {
 // 初始化数据
  $scope.level="0";
  $scope.programe="ccp";

  $scope.paginationConf = {
    //  currentPage: 1, //起始页
    //totalItems: 120,//总共有多少条记录
    itemsPerPage: 10, //每页展示的数量
    pagesLength: 5,//页码展示长度
    perPageOptions: [10, 20, 30],
    onChange: function(){
      $scope.load();
    }
};

//当页码和页面记录数发生变化时监控后台查询如果把currentPage和itemsPerPage分开监控的话则会触发两次后台事件。  
// $scope.$watch('paginationConf.currentPage + paginationConf.itemsPerPage',  $scope.load()); 

 //查询
  $scope.submit=function () {
    $scope.paginationConf.itemsPerPage="10";
    $scope.paginationConf.currentPage="1";
    $scope.load();
    };
  $scope.export=function () {
     switch($scope.programe)
     {
      case "ccp":
      window.location.href= '/getccplog/export?level='+ $scope.l+"&keyword="+ $scope.k+"&startTime="+ $scope.s+"&endTime="+ $scope.e;
      break;
      case "tms":
      window.location.href= '/gettmslog/export?level='+$scope.l+"&keyword="+$scope.k+"&startTime="+$scope.s+"&endTime="+$scope.e;
      break;
      case "csp":
      window.location.href= '/getcsplog/export?level='+$scope.l+"&keyword="+$scope.k+"&startTime="+$scope.s+"&endTime="+$scope.e;
      break;
    }
    };
  $scope.load=function(){
    $scope.s = $scope.startTime || '';
    $scope.e = $scope.endTime || '';
    $scope.l = $scope.level || '';
    $scope.k =$scope.keyword || '';
    $scope.count =$scope.paginationConf.itemsPerPage || '10';
    $scope.skip = ($scope.paginationConf.currentPage-1)*$scope.count || '0';
    console.log('programe',$scope.programe);
    switch($scope.programe)
    {
      case "ccp":
      $http
      .get('/getccplog?level='+ $scope.l+"&keyword="+ $scope.k+"&startTime="+ $scope.s+"&endTime="+ $scope.e+"&skip="+ $scope.skip+"&count="+ $scope.count)
      .success(function (data) {
        //解析服务端返回的结果
        console.log(data.data);
        $scope.total=data.data.total;
        $scope.paginationConf.totalItems=data.data.total;
        $scope.list=data.data.data;
        $scope.show=data.status;
        $scope.curcount=data.data.curcount;
      })
      break;
      case "tms":
      $http
      .get('/gettmslog?level='+$scope.l+"&keyword="+$scope.k+"&startTime="+$scope.s+"&endTime="+$scope.e+"&skip="+$scope.skip+"&count="+$scope.count)
      .success(function (data) {
        //解析服务端返回的结果
        console.log(data.data);
        $scope.total=data.data.total;
        $scope.paginationConf.totalItems=data.data.total;
        $scope.list=data.data.data;
        $scope.show=data.status;
        $scope.curcount=data.data.curcount;
      })
      break;
      case "csp":
      $http
      .get('/getcsplog?level='+$scope.l+"&keyword="+$scope.k+"&startTime="+$scope.s+"&endTime="+$scope.e+"&skip="+$scope.skip+"&count="+$scope.count)
      .success(function (data) {
        //解析服务端返回的结果
        console.log(data.data);
        $scope.total=data.data.total;
        $scope.paginationConf.totalItems=data.data.total;
        $scope.list=data.data.data;
        $scope.show=data.status;
        $scope.curcount=data.data.curcount;
      })
      break;
    }
  }
 
  }]);