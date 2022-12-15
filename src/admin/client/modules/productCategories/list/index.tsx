import { connect } from "react-redux"
import { fetchProducts } from "../../products/actions"
import {
  createCategory,
  fetchCategoriesIfNeeded,
  selectCategory,
} from "../actions"
import List from "../components/list"

const mapStateToProps = state => {
  return {
    items: state.productCategories.items,
    selectedId: state.productCategories.selectedId,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onLoad: () => {
      dispatch(fetchCategoriesIfNeeded())
    },
    onSelect: categoryId => {
      dispatch(selectCategory(categoryId))
      dispatch(fetchProducts())
    },
    onCreate: () => {
      dispatch(createCategory())
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(List)
