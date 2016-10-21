var socket = io();

$(document).ready(function() {

    $('#form-reply #reply').click(function(e) {
        var $message = $('#form-reply #message');
        var $spinner = $('#form-reply .fa-spinner');

        var subject = $('#form-reply #subject').val(),
            thread_id = $('#form-reply #thread_id').val(),
            reply_to_message_id = $('#form-reply #reply_to_message_id').val(),
            to_email = $('#form-reply #to_email').val(),
            to_name = $('#form-reply #to_name').val(),
            message_id = $('#form-reply #last_message_id').val(),
            message = $message.val();

        $spinner.show();

        if($message.val().length > 0) {
            var data = {
                reply_to_message_id: reply_to_message_id,
                thread_id: thread_id,
                to_email: to_email,
                to_name: to_name,
                subject: subject,
                message_id: message_id,
                message: message
            };

            $.post('/message/send', data, function(response) {
                console.log(response);

                $.notify({ message: 'Your message has been sent to ' + to_name }, { type: 'success' });
                $message.val('');

                var $container = $('#message-container');
                var msg = $container.find('.list-group').first().clone();
                msg.find('.subject').html(subject);
                msg.find('.body').html(message);
                msg.find('a.list-group-item').removeClass('inbox').addClass('sent');

                $container.append(msg);

            }).fail(function() {
                $.notify({ message: 'Could not send message to  ' + to_name }, { type: 'danger' });
            }).always(function() {
                $spinner.hide();
            });
        }
    });

    socket.on('serverInit', function (msg) {
        console.log('Something detected on server side', msg);
    });
});
