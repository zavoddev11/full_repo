import { ComponentLoader } from 'adminjs'

const componentLoader = new ComponentLoader()

const Components = {
    Dialogue: componentLoader.add('Mydialogue', './Dialogue'),
}

export { componentLoader, Components }