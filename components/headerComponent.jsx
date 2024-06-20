import { View, Text, TouchableOpacity } from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { useTranslation } from 'react-i18next';

const HeaderComponent = ({ isSignInPage, goToSignInPage, goToSignUpPage }) => {

    
    const { t, i18n } = useTranslation();

    const changeLangage = (lang) => {
        i18n.changeLanguage(lang)
    }


    return (

        <View style={{ flexDirection: 'row', paddingTop: 10, paddingBottom:10}}>

            <View style={{ flex: 3, flexDirection: 'row' }}>
                <TouchableOpacity style={{ marginRight: 5 }} onPress={goToSignInPage} disabled={isSignInPage}>
                    <Text style={{ color: isSignInPage ? '#19363C' : '#ccc' }}>
                        {t('signin')}|
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={goToSignUpPage} disabled={!isSignInPage}>
                    <Text style={{ color: !isSignInPage ? '#19363C' : '#ccc' }}>
                        {t('signup')}
                    </Text>
                </TouchableOpacity>
            </View>


            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Menu>
                    <MenuTrigger>
                        {
                            i18n.language === 'fr' ?
                                <Text> &#x1F1E8;&#x1F1F5; {t('french')}</Text>
                                :
                                <Text> &#x1F1EC;&#x1F1E7; {t('english')}</Text>
                        }
                    </MenuTrigger>
                    <MenuOptions>

                        <MenuOption onSelect={() => changeLangage('fr')} >
                            <Text style={{}}> &#x1F1E8;&#x1F1F5; {t('french')}</Text>
                        </MenuOption>

                        <MenuOption onSelect={() => changeLangage('en')} >
                            <Text style={{}}> &#x1F1EC;&#x1F1E7; {t('english')}</Text>
                        </MenuOption>

                    </MenuOptions>
                </Menu>
            </View>

        </View>

    )


};

export default HeaderComponent;
