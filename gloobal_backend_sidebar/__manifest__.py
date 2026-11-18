# -*- coding: utf-8 -*-
{
    'name': 'Gloobal Backend Sidebar',
    'version': '20.0.1.0.0',
    'category': 'Hidden/Tools',
    'summary': "Barre latérale de navigation dans le back-end",
    'description': """
Remplace les menus de la barre du haut du client web par une barre latérale
à gauche : applications, menus et sous-menus de l'application ouverte,
entrée active en évidence, repli (gardé dans le navigateur), panneau
coulissant sur mobile. S'appuie sur le service menu et les composants
natifs d'Odoo, couleurs des thèmes clair et sombre.
    """,
    'author': 'Gloobal',
    'website': 'https://github.com/gloobal-io/odoo_sidebar',
    'license': 'LGPL-3',
    'depends': ['web'],
    'data': [],
    'assets': {
        'web.assets_backend': [
            'gloobal_backend_sidebar/static/src/**/*',
        ],
    },
    'installable': True,
    'application': False,
    'auto_install': False,
}
