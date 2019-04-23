import * as safeStorage from '../../utils/safe_storage';

export const types = {
  SET_PAGE_SIZE: 'SET_PAGE_SIZE',
  SET_DATA_VIEW: 'SET_DATA_VIEW'
};


export function updatePageSize(pageSize) {
  return {
    type: types.SET_PAGE_SIZE,
    pageSize: pageSize
  };
}

export function updateDataView(dataView) {
  return {
    type: types.SET_DATA_VIEW,
    dataView: dataView
  };
}

export const setDataView = (dataView) => dispatch => {
  safeStorage.setItem('dataView', dataView);
  dispatch(updateDataView(dataView));
};

export const setPageSize = (pageSize) => dispatch => {
  safeStorage.setItem('pageSize', pageSize);
  dispatch(updatePageSize(pageSize));
};
