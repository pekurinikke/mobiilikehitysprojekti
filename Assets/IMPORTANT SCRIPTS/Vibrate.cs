using UnityEngine;
using UnityEngine.UI;
public class Vibrate : MonoBehaviour
{
    [SerializeField]
    private Button defaultVibrationButton;

    private void OnEnable()
    {
        defaultVibrationButton.onClick.AddListener(DefaultVibration);
    }
    private void OnDisable()
    {
        defaultVibrationButton.onClick.RemoveListener(DefaultVibration);
    }
    private void DefaultVibration(){
        Handheld.Vibrate();
        Debug.Log("Vibration Detected");
    }
}
