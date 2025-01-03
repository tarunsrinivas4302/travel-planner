import * as Types from '../types'

const initialState = {
    loading: false,
    error: null,
    data: [],
    singleTravelData: [],
}

export const travelSuggestionsReducer = (state = initialState, action) => {
    switch (action.type) {
        case Types.FETCH_REQUEST:
            return { ...state, loading: true };
        case Types.FETCH_TRAVEL_SUGGESTIONS:
            return {
                ...state,
                data: action.payload.data,
                loading: false,
                error: null
                
            }
        case Types.FETCH_SINGLE_TRIP:
            return {
                ...state,
                loading: false,
                singleTravelData: [],
                error: null,
            }
        default:
            return initialState
    }
}